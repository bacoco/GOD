# UI Improve Command

## Description
Comprehensive UI improvement pipeline that orchestrates multiple specialized agents to enhance visual quality, interactivity, and user experience.

## Usage
```
/ui-improve [options]
```

## Options
- `--screen <name>`: Target specific screen/component (default: all)
- `--focus <area>`: Focus on specific area (visual|interaction|microcopy|all)
- `--mode <mode>`: Execution mode (analyze|enhance|full)
- `--auto-fix`: Automatically apply safe improvements

## ACTIVATION

When the user invokes `/ui-improve`, execute this comprehensive UI enhancement workflow:

### Step 1: Initial Analysis
First, acknowledge the request and explain the process:

```
I'll run a comprehensive UI improvement analysis using specialized agents:
- **Oracle**: Extract and analyze design patterns
- **Pixel**: Assess current UI quality
- **Harmonia**: Optimize for your audience
- **Iris**: Enhance interactivity
- **Calliope**: Improve microcopy consistency

Let me start by analyzing your current UI...
```

### Step 2: Capture Current State

Use the Pixel agent to capture the current UI state:

```
## 📸 Capturing Current UI State

Analyzing:
- Visual consistency
- Component patterns
- Color usage
- Typography hierarchy
- Spacing rhythm
- Interactive states
- Microcopy consistency
```

### Step 3: Run Oracle Analysis

Activate Oracle agent to extract design tokens:

```
## 👁️ Extracting Design Patterns (Oracle)

Found:
- **Primary Colors**: [List extracted colors]
- **Typography Scale**: [List font sizes]
- **Spacing Pattern**: [Identify rhythm]
- **Component Styles**: [List patterns]

Generating design token system...
```

### Step 4: Quality Assessment

Use Pixel to score current quality:

```
## 🎯 UI Quality Assessment (Pixel)

Overall Score: X.X/10

Breakdown:
- Visual Consistency: X/10
- Accessibility: X/10
- Interactivity: X/10
- Microcopy: X/10
- Performance: X/10

Key Issues:
1. [Issue description] (Severity: High/Medium/Low)
2. [Issue description] (Severity: High/Medium/Low)
```

### Step 5: Audience Optimization

Activate Harmonia for audience-specific optimization:

```
## 🔄 Audience Optimization (Harmonia)

Target Audience Analysis:
- User Type: [Identified type]
- Key Needs: [List needs]
- Psychological Factors: [List factors]

Token Optimizations:
- Colors: [Adjustments for audience]
- Typography: [Readability improvements]
- Spacing: [Cognitive load optimization]
```

### Step 6: Interactivity Enhancement

Use Iris agent to identify interaction opportunities:

```
## ✨ Interactivity Analysis (Iris)

Opportunities Identified:
1. **[Component]**: Add hover state for better affordance
2. **[Component]**: Implement smooth transitions
3. **[Component]**: Add loading state animation

Performance Impact: +XKB, maintains 60fps
```

### Step 7: Microcopy Audit

Activate Calliope agent for content consistency:

```
## 💬 Microcopy Analysis (Calliope)

Calliope Consistency: X/10

Issues Found:
- Inconsistent error messages
- Varying button labels for same actions
- Missing helpful placeholder text

Improvements:
- Standardized error pattern
- Consistent CTA language
- Helpful empty states
```

### Step 8: Generate Improvement Plan

Create comprehensive improvement plan with all agents' input:

```
## 📋 UI Improvement Plan

### Priority 1: Critical Issues (Impact: High)
1. **Fix Color Contrast**
   - Current: [color] on [background] = 2.5:1
   - Recommended: [new color] = 4.5:1
   - Agent: Oracle + Pixel

2. **Add Missing Focus States**
   - Affected: All interactive elements
   - Solution: Consistent focus ring pattern
   - Agent: Iris + Pixel

### Priority 2: Major Enhancements (Impact: Medium)
1. **Standardize Button Styles**
   - Create consistent hover/active states
   - Implement proper loading states
   - Agent: Oracle + Iris

2. **Improve Error Messages**
   - Apply helpful error pattern
   - Add actionable guidance
   - Agent: Calliope

### Priority 3: Polish (Impact: Low)
1. **Micro-interactions**
   - Subtle hover animations
   - Smooth transitions
   - Agent: Iris

### Implementation Order:
1. Design token updates (Oracle)
2. Component style fixes (Pixel)
3. Interaction enhancements (Iris)
4. Microcopy improvements (Calliope)
5. Final validation (Pixel)
```

### Step 9: Show Code Examples

Provide specific implementation examples:

```
## 💻 Implementation Examples

### Design Tokens (CSS Variables)
```css
:root {
  /* Optimized color palette */
  --color-primary-500: #0066FF;
  --color-text-primary: #1A1A1A;
  
  /* Improved spacing scale */
  --space-unit: 0.25rem;
  --space-xs: calc(var(--space-unit) * 2);
  
  /* Animation tokens */
  --transition-base: 200ms ease-out;
}
```

### Enhanced Button Component
```jsx
const Button = ({ children, loading, ...props }) => (
  <motion.button
    className="button"
    whileHover={{ y: -1 }}
    whileTap={{ scale: 0.98 }}
    disabled={loading}
    {...props}
  >
    {loading ? <Spinner /> : children}
  </motion.button>
);
```

### Improved Error Message
```javascript
// Before: "Error: Invalid input"
// After:
const errorMessage = {
  email: {
    invalid: "Please include an @ in your email address",
    empty: "We need your email to continue"
  }
};
```

### Step 10: Offer Execution Options

```
## 🚀 Ready to Implement?

I can help you implement these improvements:

1. **Generate patch files** - Create files you can review and apply
2. **Update design tokens** - Modify your token system
3. **Create component examples** - Show enhanced components
4. **Export improvement guide** - Detailed documentation

What would you like to do?
- Type `1` for patch files
- Type `2` for design token updates
- Type `3` for component examples
- Type `4` for full documentation
- Type `all` for everything
```

## Implementation Details

### Workflow Orchestration
```javascript
const uiImproveWorkflow = async (options) => {
  const agents = {
    oracle: new OracleAgent(),
    pixel: new PixelAgent(),
    harmonia: new HarmoniaAgent(),
    iris: new IrisAgent(),
    calliope: new CalliopeAgent()
  };
  
  // Phase 1: Analysis
  const currentState = await agents.pixel.capture();
  const tokens = await agents.vision.extractTokens(currentState);
  const quality = await agents.pixel.assess(currentState, tokens);
  
  // Phase 2: Optimization
  const audience = await agents.fusion.analyzeAudience();
  const optimizedTokens = await agents.fusion.optimize(tokens, audience);
  
  // Phase 3: Enhancement
  const interactions = await agents.motion.identifyOpportunities(currentState);
  const microcopy = await agents.calliope.audit(currentState);
  
  // Phase 4: Validation
  const improvements = compileImprovements(all);
  const finalScore = await agents.pixel.validate(improvements);
  
  return {
    before: quality,
    after: finalScore,
    improvements,
    implementation: generateImplementation(improvements)
  };
};
```

## Success Metrics

Track improvement success:
- **Quality Score**: Target 8.5+/10
- **Accessibility**: WCAG AA compliance
- **Performance**: Maintain 60fps
- **Consistency**: 90%+ token usage
- **User Satisfaction**: Improved UX metrics

## Example Output

```
UI Improvement Complete! 🎉

Before: 6.2/10
After: 8.7/10 (+2.5)

✅ Fixed 3 critical accessibility issues
✅ Added 12 micro-interactions
✅ Standardized 24 UI strings
✅ Improved 8 component styles
✅ Created comprehensive design token system

The improvements are ready to implement. Your UI is now more consistent, accessible, and delightful!
```