import { GoogleGenerativeAI } from "@google/generative-ai";
import { ShortcutStory, WeekRange } from '../types';

export async function generateChangelog(stories: ShortcutStory[], apiKey: string, dateRange: WeekRange): Promise<string> {
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
    const completedAt = s.completed_at ? new Date(s.completed_at).toLocaleDateString('es-ES') : 'Fecha desconocida';
    const partialStatus = s.isPartial ? '\n    STATUS: [PARTIAL] Solo se ha completado una parte de esta iniciativa (ej: Backend o Frontend).' : '\n    STATUS: [COMPLETED] Tarea totalmente finalizada.';

    return `[FECHA: ${completedAt}] [TEAM: ${team}] [TYPE: ${type}] ${name}${epicInfo}
    Owners: ${owners}
    Labels: ${labels}${partialStatus}
    Context: ${desc}`;
  }).join('\n\n');

  const today = new Date().toLocaleDateString('es-ES');
  const startDateStr = new Date(dateRange.start).toLocaleDateString('es-ES');
  const endDateStr = new Date(dateRange.end).toLocaleDateString('es-ES');

  const prompt = `Actúa como un Senior Product Manager. Hoy es ${today}. Genera un changelog semanal profesional para el periodo estrictamente comprendido entre el ${startDateStr} y el ${endDateStr} (${dateRange.label}).
  
IMPORTANTE: 
1. Debes agrupar las actualizaciones por EQUIPO (Team/Squad). 
2. Para cada tarea, menciona su épica correspondiente SOLO si la tiene asignada. Si no tiene épica, no menciones nada al respecto.
3. Incluye los tags (labels) y los dueños (owners) de cada tarea relevante.
4. Si una tarea está marcada como "[PARTIAL]", indica explícitamente que "solo se ha completado una parte" (como el frontend o el backend) y que la iniciativa sigue en curso. Si no es parcial, trátala como completada.
5. NO TE INVENTES FECHAS. Usa exclusivamente las fechas proporcionadas.

Aquí tienes las tareas completadas en el periodo del ${startDateStr} al ${endDateStr} (${dateRange.label}):

${storiesSummary}

Instrucciones de formato:
1. El título debe ser EXACTAMENTE: "# 📋 Weekly Product Changelog (${dateRange.label}: ${startDateStr} - ${endDateStr})". No uses otro título.
2. Usa el nombre del equipo como encabezado secundario (ej: "## Team Payments").
3. Dentro de cada equipo, lista las mejoras de forma concisa.
4. Traduce términos técnicos a beneficios para el usuario.
5. Usa Markdown elegante.
6. Si hay tareas "General" o "Sin Equipo", agrúpalas al final.
7. Comienza con un párrafo breve de "Resumen de la Semana" que destaque el impacto global de lo entregado entre el ${startDateStr} y el ${endDateStr}.`;

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
    throw new Error(`Error de IA: ${error.message || 'Error desconocido'}`);
  }
}
