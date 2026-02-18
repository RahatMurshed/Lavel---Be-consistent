
# Future Roadmap -- The "Identity & Evolution" Expansion

Based on the current "Consistency Operating System" architecture, the application is perfectly positioned to move from a "Habit Tracker" to a "Life Operating System." Here are the recommended next steps to deepen the product's value:

---

## 1. Identity Alignment Dashboard
Currently, habits are linked to identities, but that connection is mostly invisible.
- **The "Voting" System**: Visualize James Clear's concept that "every action is a vote for the person you wish to become."
- **Progress Bars**: Show alignment percentages for each identity (e.g., "The Writer" - 85% aligned this week).
- **Identity Evolution**: Track how your identities change over months, not just days.

## 2. Seasonal Modes (Grace vs. Sprint)
Life isn't linear. The database already contains a `seasonal_modes` table that can be activated.
- **Sprint Mode**: For when energy is high; rewards "Full" versions more heavily.
- **Grace Mode**: For travel, sickness, or high stress; shifts the UI to celebrate "Minimum" versions as the primary win.
- **Maintenance Season**: Focuses purely on consistency over intensity to prevent burnout.

## 3. Post-Onboarding Habit Management
Currently, habits can only be configured during the onboarding flow.
- **Habit OS View**: A dedicated page to audit your "Operating System"—archive habits that no longer serve you, edit the "Min/Full" versions based on your consistency data, and re-link them to new identities.

## 4. AI Consistency Coach (Real Reflection)
The "AI Mirror" on the dashboard currently uses simple logic. We can upgrade this to a true AI Coach.
- **Behavioral Analysis**: The AI analyzes your `consistency_scores` (Resilience, Recovery, Energy Alignment).
- **Proactive Advice**: If your "Recovery Speed" is dropping, the AI might suggest switching to "Grace Mode" for a few days to prevent a total break in consistency.

---

### Technical Implementation Priority
| Priority | Feature | Complexity | Impact |
|:---:|---|:---:|:---:|
| 1 | **Habit Management View** | Medium | Essential for long-term use |
| 2 | **Identity Progress Visualization** | Low | High emotional reward |
| 3 | **AI Coach (Edge Function)** | Medium | High premium feel |
| 4 | **Seasonal Mode Switching** | Medium | Unique consistency protection |

### Implementation Design for Habit Management
````text
New Page: /habits (or /identities)
- Layout: Grid of current Identities
- Card Content: List of habits under that identity
- Interaction: "Add Habit", "Edit Version", "Archive"
- Integration: Reuses `useActiveHabits` and adds `useArchiveHabit` / `useUpdateHabit` mutations.
````

**What should we tackle first?** I'm ready to build the **Habit Management View** or the **Identity Alignment Dashboard** whenever you're ready.