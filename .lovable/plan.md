
I will remove the motion effects specifically associated with the authentication card in `src/pages/Auth.tsx`.

### Analysis:
1.  **Entry Animation**: The entire card container is currently wrapped in a `motion.div` that slides up and fades in on page load.
2.  **Shimmer Border**: The card uses the `shimmer-border` class, which adds an animated gradient border.
3.  **Background Motion**: There are background glow elements with `animate-pulse-glow`.
4.  **Logo Animation**: The `BrandMark` has an `animated` prop.

The user's request "remove the auth card motion" most directly points to the entrance animation of the card itself. I will also remove the `shimmer-border` from the card to ensure it feels static as requested, while keeping the background and logo animations which provide ambient atmosphere without making the card itself feel "in motion".

### Proposed Changes:
-   **`src/pages/Auth.tsx`**:
    -   Replace the `motion.div` wrapping the logo and card with a standard `div`.
    -   Remove the `shimmer-border` class from the `Card` component.
    -   Keep the `AnimatePresence` for the rotating quotes, as that is a text transition rather than "card motion".

### Technical Steps:
1.  Modify `src/pages/Auth.tsx` to remove the `motion.div` wrapper around the main content (lines 62-67 and the closing tag).
2.  Remove `shimmer-border` from the `Card` className (line 81).
