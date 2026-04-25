import * as vscode from 'vscode';
import { Mistral } from '@mistralai/mistralai';

// Mapping des langages VS Code vers leur syntaxe de commentaire
const COMMENT_SYNTAX: Record<string, string> = {
	typescript: '//',
	typescriptreact: '//',
	javascript: '//',
	javascriptreact: '//',
	python: '#',
	ruby: '#',
	shellscript: '#',
	yaml: '#',
	dockerfile: '#',
	go: '//',
	rust: '//',
	java: '//',
	c: '//',
	cpp: '//',
	csharp: '//',
	php: '//',
	swift: '//',
	kotlin: '//',
	sql: '--',
	lua: '--',
	scss: '//',
};

const SYSTEM_PROMPT = `Tu es CodeBoussole, un assistant qui génère du PSEUDO-CODE en LANGAGE NATUREL pour aider un développeur à structurer sa logique avant d'écrire son code.

PRINCIPE FONDAMENTAL :
Le pseudo-code n'est PAS du code. C'est une description de la logique en langage humain.
Imagine que tu expliques l'algorithme à un collègue à voix haute, sans clavier.

INTERDIT ABSOLU :
- Pas de syntaxe du langage cible (pas de "def", "function", "if", "else", "return", "for", "while", etc.)
- Pas de parenthèses de fonction, pas d'opérateurs (==, &&, +=, etc.)
- Pas de types ni de déclarations de variables formelles
- Pas de noms de méthodes ou d'API précises
- Surtout : NE PAS écrire le code en commentaires. Si en retirant le préfixe de commentaire on obtient du code valide, c'est échoué.

OBLIGATOIRE :
- Écris en langage naturel (français si le code source est en français, anglais sinon)
- Sois précis sur la LOGIQUE : nomme les variables, énumère les conditions, décris les structures
- Granularité : une ligne de pseudo-code = une étape de raisonnement (pas une ligne de code)
- Si une décision est ambiguë, écris "TODO: décider X" plutôt que d'inventer

EXEMPLE DE BONNE SORTIE pour "calculer une remise selon fidélité" :
//~ initialiser la remise à zéro
//~ si le client est premium → remise = 10% du montant total
//~ sinon, selon le nombre d'achats du client :
//~   - 10 ou plus → remise = 5% du montant
//~   - entre 5 et 9 → remise = 2% du montant
//~   - moins de 5 → pas de remise
//~ retourner le montant de la remise arrondi à 2 décimales

EXEMPLE DE MAUVAISE SORTIE (à NE PAS faire) :
//~ remise = 0
//~ if est_premium: remise = montant * 0.10
//~ elif achats >= 10: remise = montant * 0.05
(C'est du code, pas du pseudo-code.)

FORMAT DE SORTIE :
- Renvoie UNIQUEMENT les lignes de pseudo-code, sans backticks, sans introduction, sans conclusion
- Chaque ligne commence par le préfixe de commentaire fourni
- Pas de ligne vide au début ou à la fin`;

export function activate(context: vscode.ExtensionContext) {
	console.log('CodeBoussole est actif');

	const disposable = vscode.commands.registerCommand(
		'codeboussole.generatePlan',
		async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showWarningMessage('Aucun fichier ouvert.');
				return;
			}

			// Récupération de la config
			const config = vscode.workspace.getConfiguration('codeboussole');
			const apiKey = config.get<string>('apiKey');
			const model = config.get<string>('model') ?? 'codestral-latest';
			const markerPrefix = config.get<string>('markerPrefix') ?? '~';

			if (!apiKey) {
				const choice = await vscode.window.showErrorMessage(
					'Clé API Mistral manquante. Configure-la dans les paramètres.',
					'Ouvrir les paramètres'
				);
				if (choice === 'Ouvrir les paramètres') {
					vscode.commands.executeCommand(
						'workbench.action.openSettings',
						'codeboussole.apiKey'
					);
				}
				return;
			}

			// Détection du langage et du préfixe de commentaire
			const languageId = editor.document.languageId;
			const commentChar = COMMENT_SYNTAX[languageId] ?? '//';
			const fullPrefix = `${commentChar}${markerPrefix} `;

			// Récupération du contexte : tout le fichier + position curseur
			const fullText = editor.document.getText();
			const cursorPos = editor.selection.active;
			const cursorLine = cursorPos.line;

			const userPrompt = `Voici un fichier ${languageId} :

\`\`\`${languageId}
${fullText}
\`\`\`

Le curseur est à la ligne ${cursorLine + 1}.

Génère un pseudo-code détaillé pour la logique que je vais écrire à cet endroit. Chaque ligne doit commencer par "${fullPrefix}".`;

			// Appel API avec indicateur de progression
			await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: 'CodeBoussole génère un plan...',
					cancellable: false,
				},
				async () => {
					try {
						const client = new Mistral({ apiKey });
						const response = await client.chat.complete({
							model,
							messages: [
								{ role: 'system', content: SYSTEM_PROMPT },
								{ role: 'user', content: userPrompt },
							],
						});

						const rawContent = response.choices?.[0]?.message?.content;
						if (!rawContent || typeof rawContent !== 'string') {
							vscode.window.showErrorMessage(
								'CodeBoussole : réponse vide de Mistral.'
							);
							return;
						}

						// Insertion du résultat à la ligne du curseur
						const insertPos = new vscode.Position(cursorLine, 0);
						await editor.edit((editBuilder) => {
							editBuilder.insert(insertPos, rawContent.trim() + '\n');
						});
					} catch (error) {
						const message =
							error instanceof Error ? error.message : String(error);
						vscode.window.showErrorMessage(
							`CodeBoussole : erreur API — ${message}`
						);
					}
				}
			);
		}
	);

	context.subscriptions.push(disposable);
}

export function deactivate() {}