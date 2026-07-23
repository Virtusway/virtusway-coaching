---
name: form-psychology
description: Create and optimize forms, lead magnets, and conversion/onboarding flows using UX psychology principles (reducing decision fatigue, smart defaults, goal gradient effect, reciprocity, IKEA effect, ethical loss aversion). Use when asked to design, build, or audit form interfaces, signup flows, or lead capture components.
---

# Form Psychology & Persuasive UX Design

This skill provides guidelines and patterns for designing and developing high-converting forms based on user psychology, inspired by top-tier product design principles (such as those analyzed by uxpeak).

## Core Psychological Principles

### 1. Decision Fatigue & Cognitive Load (Fatiga de Decisión)
*   **Concept:** Users have a limited amount of mental energy. Complex, empty, or long forms create friction and lead to abandonment.
*   **Design Rules:**
    *   **Minimize Input Fields:** Only ask for what is absolutely necessary (e.g., email first, name optional).
    *   **Pre-fill and Auto-focus:** Pre-populate fields where possible and focus the first input field on page load.
    *   **Assumptions:** Use geolocation or browser language to pre-set choices.
    *   **Visual Grouping:** Break forms into logical sections or steps to avoid overwhelming the user.

### 2. Smart Defaults (Valores Predeterminados Inteligentes)
*   **Concept:** Default choices act as implicit recommendations. They reduce the number of active decisions a user has to make.
*   **Design Rules:**
    *   **Recommended Options:** Pre-select options that represent the best value or the most common user choice.
    *   **Compliance Friendly:** Ensure default options are legally compliant (e.g., active check for marketing consents under GDPR/privacy regulations, but make the checkbox card visually appealing and easy to read).

### 3. Goal Gradient Effect / Onboarding Progress (Gradiente de Meta)
*   **Concept:** People are more motivated to complete a task as they get closer to the goal. A progress bar starting at "0%" is demotivating.
*   **Design Rules:**
    *   **Head Start:** Start the progress tracker above 0% (e.g., "15% Complete: We have identified your download").
    *   **Micro-rewards:** Frame entering information as completing steps (e.g., "Step 1: Resource reserved ✔").
    *   **Immediate Feedback:** Show step indicators that fill in as fields are completed.

### 4. Reciprocity / Value First (Valor antes del Registro)
*   **Concept:** Users are much more likely to share their contact information if they have already experienced value or trust.
*   **Design Rules:**
    *   **Value Preview:** Show snippet previews, pages, or a summary of the value they will get.
    *   **Frictionless First Interaction:** Let users interact with a tool (e.g., a calculator or questionnaire) before prompting them to save/download results via email.

### 5. IKEA Effect & Endowment Effect (Efecto IKEA)
*   **Concept:** Users place higher value on things they have invested effort in creating or customizing.
*   **Design Rules:**
    *   **Configuration:** Let users personalize their download or experience (e.g., "Which topic interests you most? [ ] Tech Teams [ ] Female Leadership").
    *   **Interactive Input:** Letting the user check options makes the final result feel tailored to them.

### 6. Ethical Loss Aversion & Framing (Aversión a la Pérdida Ética)
*   **Concept:** The fear of losing or missing out on something is a stronger motivator than the prospect of gaining it.
*   **Design Rules:**
    *   **Loss Framing:** Frame the action around what they would lose or miss (e.g., "Don't miss the 5 questions that clarify your leadership values" instead of "Subscribe to get the guide").
    *   **NO Dark Patterns:** Avoid fake countdowns, artificial scarcity, or misleading framing. Use honest, value-centric copy.

---

## Technical Implementation Patterns (Astro & Tailwind CSS)

### High-Converting Form Structure
When creating a form component (like [LeadMagnet.astro](file:///d:/Repositories/virtusway-coaching/src/components/LeadMagnet.astro)), use a structure that leverages these principles:

```html
<!-- Interactive customization (IKEA Effect) -->
<div class="mb-6">
  <p class="text-sm font-medium mb-2">Personaliza tu guía. ¿Cuál es tu enfoque principal?</p>
  <div class="grid grid-cols-2 gap-3">
    <button type="button" class="btn-select" data-option="mujeres">Liderazgo Femenino</button>
    <button type="button" class="btn-select" data-option="equipos">Equipos TIC</button>
  </div>
</div>

<!-- Step/Progress indicator (Goal Gradient Effect) -->
<div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-6">
  <div class="bg-leaf h-full transition-all duration-300" style="width: 35%;" data-progress-bar></div>
</div>
```

### Form State UI Guidelines
1.  **Idle State:** Focus styling should use clear borders (e.g., `focus:ring-2 focus:ring-leaf/50`).
2.  **Loading State:** Show a loading spinner or disable the button and change label to "Preparando tu descarga...".
3.  **Success State (Toast/Overlay):** Slide-in toast notifications from the side or top with smooth micro-animations. Ensure screen readers announce it (`role="status"`).
4.  **Error State:** Inline error messages below the input with a soft red background or text, keeping the field focused for quick correction.
