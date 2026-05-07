import OpenAI from 'openai'
import type { ReponseEvaluation } from '@/types'

interface OptionsEvaluation {
  cleApi: string
  promptEvaluation: string
  promptReformulation: string
  contenuDiscours: string
  nomDiscours: string
}

/**
 * Évalue un discours politique via l'API OpenAI
 * et retourne l'analyse + la reformulation
 */
export async function evaluerDiscours(
  options: OptionsEvaluation
): Promise<ReponseEvaluation> {
  const { cleApi, promptEvaluation, promptReformulation, contenuDiscours, nomDiscours } = options

  if (!cleApi) {
    throw new Error("Clé API IA non configurée. Veuillez la renseigner dans les paramètres.")
  }

  if (!contenuDiscours || contenuDiscours.trim().length < 50) {
    throw new Error("Le contenu du discours est trop court pour être analysé (minimum 50 caractères).")
  }

  const client = new OpenAI({ apiKey: cleApi })

  // ---- Étape 1 : Évaluation ----
  const messageEvaluation = `
${promptEvaluation}

---
DISCOURS À ANALYSER : "${nomDiscours}"
---
${contenuDiscours}
---

Répondez en JSON avec la structure suivante :
{
  "analyse": "Texte de l'analyse complète en français (HTML autorisé pour la mise en forme)",
  "score_persuasion": <entier entre 0 et 100>,
  "score_clarte": <entier entre 0 et 100>,
  "points_forts": ["point 1", "point 2", ...],
  "axes_amelioration": ["axe 1", "axe 2", ...]
}
`

  const reponseEval = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Vous êtes un expert en analyse politique institutionnelle. Répondez uniquement en JSON valide.' },
      { role: 'user', content: messageEvaluation },
    ],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  })

  const contenuEval = reponseEval.choices[0]?.message?.content
  if (!contenuEval) {
    throw new Error("La réponse de l'IA est vide pour l'évaluation.")
  }

  let donneesEval: {
    analyse: string
    score_persuasion: number
    score_clarte: number
    points_forts: string[]
    axes_amelioration: string[]
  }

  try {
    donneesEval = JSON.parse(contenuEval)
  } catch {
    throw new Error("Format de réponse IA invalide pour l'évaluation.")
  }

  // ---- Étape 2 : Reformulation ----
  const messageReformulation = `
${promptReformulation}

---
DISCOURS ORIGINAL : "${nomDiscours}"
---
${contenuDiscours}
---

Proposez une reformulation améliorée. Répondez en JSON :
{
  "reformulation": "Texte reformulé complet en français",
  "variante_courte": "Version courte pour réseaux sociaux (max 280 caractères)",
  "ton_recommande": "ex: Institutionnel et Inspirant"
}
`

  const reponseReform = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Vous êtes un expert en rhétorique politique. Répondez uniquement en JSON valide.' },
      { role: 'user', content: messageReformulation },
    ],
    temperature: 0.5,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  })

  const contenuReform = reponseReform.choices[0]?.message?.content
  if (!contenuReform) {
    throw new Error("La réponse de l'IA est vide pour la reformulation.")
  }

  let donneesReform: {
    reformulation: string
    variante_courte: string
    ton_recommande: string
  }

  try {
    donneesReform = JSON.parse(contenuReform)
  } catch {
    throw new Error("Format de réponse IA invalide pour la reformulation.")
  }

  // ---- Construction du HTML d'évaluation ----
  const evaluationHTML = construireHTMLEvaluation(donneesEval)
  const reformulationHTML = construireHTMLReformulation(donneesReform)

  return {
    evaluation: evaluationHTML,
    reformulation: reformulationHTML,
    score_persuasion: Math.min(100, Math.max(0, donneesEval.score_persuasion)),
    score_clarte: Math.min(100, Math.max(0, donneesEval.score_clarte)),
  }
}

function construireHTMLEvaluation(donnees: {
  analyse: string
  score_persuasion: number
  score_clarte: number
  points_forts: string[]
  axes_amelioration: string[]
}): string {
  const pointsForts = donnees.points_forts
    .map((p) => `<li>${p}</li>`)
    .join('')
  const axes = donnees.axes_amelioration
    .map((a) => `<li>${a}</li>`)
    .join('')

  return `
<div class="evaluation-ia">
  <div class="analyse-principale">
    ${donnees.analyse}
  </div>
  <div class="points-forts">
    <h4>Points Forts</h4>
    <ul>${pointsForts}</ul>
  </div>
  <div class="axes-amelioration">
    <h4>Axes d'Amélioration</h4>
    <ul>${axes}</ul>
  </div>
  <div class="scores">
    <span>Score de Persuasion : ${donnees.score_persuasion}/100</span>
    <span>Indice de Clarté : ${donnees.score_clarte}/100</span>
  </div>
</div>
  `.trim()
}

function construireHTMLReformulation(donnees: {
  reformulation: string
  variante_courte: string
  ton_recommande: string
}): string {
  return `
<div class="reformulation-ia">
  <div class="proposition-principale">
    <h4>Proposition de Signature Narrative</h4>
    <p>${donnees.reformulation}</p>
  </div>
  <div class="variante-courte">
    <h4>Variante Courte (Réseaux Sociaux)</h4>
    <p>${donnees.variante_courte}</p>
  </div>
  <div class="recommandation">
    <strong>RECOMMANDATION</strong>
    <p>Ton recommandé : <em>${donnees.ton_recommande}</em></p>
  </div>
</div>
  `.trim()
}
