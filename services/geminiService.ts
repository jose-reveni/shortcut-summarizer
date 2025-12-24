
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ShortcutStory } from '../types';

export async function generateChangelog(stories: ShortcutStory[], apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error("Missing Gemini API Key");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  // Resumen enriquecido con el nombre del equipo, épica y dueños
  const storiesSummary = stories.map(s => {
    const type = (s.story_type || 'task').toUpperCase();
    const team = s.teamName || 'General';
    const name = s.name || 'Untitled Story';
    const desc = s.description ? s.description.substring(0, 150) : 'No description provided';
    const labels = s.labels && s.labels.length > 0 ? s.labels.map(l => l.name).join(', ') : 'No labels';
    const epicInfo = s.epicName ? `\n    Epic: ${s.epicName}` : '';
    const owners = s.ownerNames && s.ownerNames.length > 0 ? s.ownerNames.join(', ') : 'Sin dueño';
    const partialStatus = s.isPartial ? '\n    STATUS: [PARTIAL] Solo se ha completado una parte de esta iniciativa (ej: Backend o Frontend).' : '\n    STATUS: [COMPLETED] Tarea totalmente finalizada.';

    return `[TEAM: ${team}] [TYPE: ${type}] ${name}${epicInfo}
    Owners: ${owners}
    Labels: ${labels}${partialStatus}
    Context: ${desc}`;
  }).join('\n\n');

  const prompt = `Actúa como un Senior Product Manager. Genera un changelog semanal profesional.
  
IMPORTANTE: 
1. Debes agrupar las actualizaciones por EQUIPO (Team/Squad). 
2. Para cada tarea, menciona su épica correspondiente SOLO si la tiene asignada. Si no tiene épica, no menciones nada al respecto.
3. Incluye los tags (labels) y los dueños (owners) de cada tarea relevante.
4. Si una tarea está marcada como "[PARTIAL]", indica explícitamente que "solo se ha completado una parte" (como el frontend o el backend) y que la iniciativa sigue en curso. Si no es parcial, trátala como completada.

Aquí tienes las tareas completadas en los últimos 7 días:

${storiesSummary}

Instrucciones de formato:
1. Usa el nombre del equipo como encabezado principal (ej: "## Team Payments").
2. Dentro de cada equipo, lista las mejoras de forma concisa.
3. Traduce términos técnicos a beneficios para el usuario.
4. Usa Markdown elegante.
5. Si hay tareas "General" o "Sin Equipo", agrúpalas al final.
6. Comienza con un párrafo breve de "Resumen de la Semana" que destaque el impacto global.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("La IA devolvió una respuesta vacía.");
    }

    return text;
  } catch (error: any) {
    console.error('Gemini Service Error:', error);
    // Attempting to provide more helpful error messages
    if (error.message?.includes('404')) {
      return `Error 404: El modelo gemini-1.5-flash no fue encontrado. Esto puede deberse a que tu API Key no tiene acceso a este modelo o el nombre es incorrecto para tu región.`;
    }
    throw new Error(`Error de IA: ${error.message || 'Error desconocido'}`);
  }
}
