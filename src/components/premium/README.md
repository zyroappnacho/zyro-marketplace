# Premium UI Components

This directory contains the premium UI components for the Zyro Marketplace application. These components implement the premium design system with golden gradients, smooth transitions, elevation effects, and focus states with golden glow.

## Components

### ZyroLogo
The official Zyro logo component with exact specifications:
- Uses Cinzel font weight 600 size 32px for "ZYR"
- Letter-spacing of 3px between letters
- Atomic symbol with 32px circle, 7px nucleus, three orbits
- 3px margin between R and atom
- Available in small, medium, and large sizes

```tsx
import { ZyroLogo } from './premium';

<ZyroLogo size="medium" color={colors.goldElegant} />
```

### PremiumButton
Enhanced button component with golden gradients and hover effects:
- Golden gradient backgrounds for primary and secondary variants
- Smooth 0.2s transitions and elevation effects
- Focus states with golden glow animation
- Support for loading states and icons
- Three variants: primary, secondary, outline

```tsx
import { PremiumButton } from './premium';

<PremiumButton
  title="Solicitar Colaboración"
  variant="primary"
  size="medium"
  fullWidth
  onPress={handlePress}
/>
```

### PremiumCard
Card component with #111111 background and golden borders:
- Dark background (#111111) with golden border accents
- Elevation effects and smooth shadows
- Focus states with golden glow for interactive cards
- Three variants: default, elevated, outlined
- Configurable padding sizes

```tsx
import { PremiumCard } from './premium';

<PremiumCard
  variant="elevated"
  padding="large"
  focusable
  onPress={handleCardPress}
>
  <Text>Card content here</Text>
</PremiumCard>
```

### PremiumInput
Form input component with premium styling:
- Golden border focus states with glow effects
- Support for left and right icons
- Error state styling with red accents
- Three variants: default, outlined, filled
- Smooth 0.2s focus transitions

```tsx
import { PremiumInput } from './premium';

<PremiumInput
  label="Email"
  placeholder="Introduce tu email"
  variant="outlined"
  size="medium"
  leftIcon={<EmailIcon />}
  error={emailError}
  value={email}
  onChangeText={setEmail}
/>
```

### PremiumModal
Modal component with backdrop blur effects:
- Backdrop blur for premium visual effect
- Golden glow border animations
- Three presentation variants: center, bottom, fullscreen
- Smooth entrance and exit animations
- Configurable blur intensity

```tsx
import { PremiumModal } from './premium';

<PremiumModal
  isVisible={showModal}
  onClose={handleCloseModal}
  variant="center"
  blurType="dark"
  blurAmount={10}
>
  <Text>Modal content here</Text>
</PremiumModal>
```

## Design System

### Colors
- **Primary Gold**: #C9A961 (goldElegant)
- **Dark Gold**: #A68B47 (goldDark)
- **Bright Gold**: #D4AF37 (goldBright)
- **Background**: #000000 (black)
- **Surface**: #111111 (darkGray)

### Typography
- **Logo Font**: Cinzel (weight 600)
- **Primary Font**: Inter
- **Letter Spacing**: 3px for logo, 0.5px for buttons

### Animations
- **Fast**: 200ms for interactions
- **Normal**: 300ms for transitions
- **Smooth**: All transitions use easing curves

### Effects
- **Elevation**: Shadow effects with golden tint
- **Glow**: Golden glow on focus states
- **Gradients**: Multi-stop golden gradients
- **Blur**: Backdrop blur for modals

## Usage Guidelines

1. **Consistency**: Always use these premium components instead of basic React Native components
2. **Color Harmony**: Stick to the golden color palette for all accents
3. **Smooth Interactions**: All interactive elements should have 0.2s transitions
4. **Focus States**: Interactive elements must have golden glow focus states
5. **Elevation**: Use appropriate shadow depths for visual hierarchy

## Installation

The components require these additional dependencies:
```bash
npm install @react-native-community/blur react-native-linear-gradient
```

## Examples

See the individual component files for detailed prop interfaces and usage examples. All components are fully typed with TypeScript for better development experience.