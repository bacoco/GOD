# UI Score Command

## Description
Comprehensive UI quality assessment that provides detailed scoring across multiple dimensions using specialized agents.

## Usage
```
/ui-score [options]
```

## Options
- `--detailed`: Show detailed breakdown for each category
- `--compare <baseline>`: Compare against a baseline score
- `--export`: Export detailed report
- `--quick`: Quick assessment (fewer checks)

## ACTIVATION

When the user invokes `/ui-score`, perform this comprehensive UI quality assessment:

### Step 1: Initialize Assessment

```
🎯 UI Quality Assessment Starting...

I'll evaluate your UI across 8 key dimensions:
- Visual Consistency
- Design System Compliance  
- Accessibility
- Interactivity & Feedback
- Microcopy & Content
- Performance Impact
- Responsive Design
- User Delight Factor

Let me analyze your interface...
```

### Step 2: Visual Consistency Check (Pixel + Vision)

```
## 📊 Visual Consistency Analysis

Checking:
✓ Color usage consistency
✓ Typography hierarchy
✓ Spacing patterns
✓ Component styling
✓ Visual rhythm

**Score: X.X/10**

Findings:
- ✅ Consistent button styles across pages
- ⚠️ 3 variations of the same blue (#0066FF, #0067FF, #0065FE)
- ❌ Inconsistent card padding (16px, 20px, 24px found)
```

### Step 3: Design System Compliance (Vision)

```
## 🎨 Design System Compliance

Token Usage Analysis:
- Colors: XX% using tokens (YY% hardcoded)
- Typography: XX% using scale
- Spacing: XX% following system
- Components: XX% standardized

**Score: X.X/10**

Non-compliant Elements:
1. Custom styled buttons in checkout flow
2. Hardcoded colors in error states
3. Ad-hoc spacing in navigation
```

### Step 4: Accessibility Audit (Pixel + Apollo)

```
## ♿ Accessibility Assessment

WCAG 2.1 Compliance:
- Color Contrast: X/X pass
- Keyboard Navigation: ✓/✗
- Screen Reader Support: ✓/✗
- Focus Indicators: X/Y elements
- Touch Targets: XX% adequate size

**Score: X.X/10**

Critical Issues:
- ❌ 2 buttons below 3:1 contrast ratio
- ❌ Missing alt text on 5 images
- ⚠️ Form inputs missing labels
```

### Step 5: Interactivity Assessment (Motion)

```
## ✨ Interactivity & Feedback

Interactive Elements Analysis:
- Hover States: XX% implemented
- Focus States: XX% visible
- Loading States: XX% present
- Error States: XX% helpful
- Micro-interactions: XX quality

**Score: X.X/10**

Missing Interactions:
- No hover feedback on cards
- Missing loading state for async actions
- Jarring page transitions
```

### Step 6: Microcopy Evaluation (Voice)

```
## 💬 Content & Microcopy

Voice Consistency Analysis:
- Tone Consistency: XX%
- Error Message Quality: X/10
- CTA Effectiveness: X/10
- Empty State Helpfulness: X/10
- Placeholder Usefulness: X/10

**Score: X.X/10**

Issues Found:
- Mixed formal/casual tone
- Generic error messages
- Weak CTAs ("Submit" vs "Get Started")
```

### Step 7: Performance Impact (Pixel + Motion)

```
## ⚡ Performance Metrics

Animation Performance:
- FPS during interactions: XX
- Paint/Layout triggers: X
- Bundle size (UI): XXkb
- CSS complexity: X rules
- Render blocking resources: X

**Score: X.X/10**

Optimization Needed:
- Heavy box-shadow animations
- Unoptimized images
- Redundant CSS rules
```

### Step 8: Responsive Design (Pixel)

```
## 📱 Responsive Design Quality

Breakpoint Analysis:
- Mobile (320-768px): X.X/10
- Tablet (768-1024px): X.X/10  
- Desktop (1024px+): X.X/10

**Score: X.X/10**

Issues by Viewport:
- Mobile: Text too small, buttons too close
- Tablet: Awkward layout in landscape
- Desktop: Excessive whitespace
```

### Step 9: User Delight Factor (All Agents)

```
## 🌟 User Delight Analysis

Delight Elements:
- Personality in Design: X/10
- Surprise & Delight Moments: X found
- Emotional Connection: X/10
- Premium Feel: X/10
- Memorable Interactions: X/10

**Score: X.X/10**

Opportunities:
- Add celebration for task completion
- Implement delightful loading states
- Create smoother transitions
```

### Step 10: Generate Overall Score

```
## 📈 Overall UI Quality Score

**Total Score: X.X/10** [Grade: B+]

Category Breakdown:
┌─────────────────────────┬───────┬────────┐
│ Category                │ Score │ Weight │
├─────────────────────────┼───────┼────────┤
│ Visual Consistency      │ 8.2   │ 15%    │
│ Design System          │ 7.5   │ 15%    │
│ Accessibility          │ 6.8   │ 20%    │
│ Interactivity          │ 7.0   │ 15%    │
│ Microcopy              │ 7.8   │ 10%    │
│ Performance            │ 8.5   │ 10%    │
│ Responsive Design      │ 7.2   │ 10%    │
│ User Delight           │ 6.5   │ 5%     │
└─────────────────────────┴───────┴────────┘

**Weighted Average: 7.4/10**

Comparative Analysis:
- Industry Average: 6.8/10
- Your Previous Score: 6.2/10 (+1.2)
- Best in Class: 9.2/10
```

### Step 11: Priority Recommendations

```
## 🎯 Prioritized Improvements

### 🔴 Critical (Do First)
1. **Fix Accessibility Issues** (+0.8 score)
   - Add missing alt text
   - Fix color contrast issues
   - Implement focus indicators

### 🟡 Important (Do Next)
2. **Standardize Design Tokens** (+0.5 score)
   - Consolidate color variations
   - Apply consistent spacing
   - Use typography scale

3. **Enhance Interactivity** (+0.4 score)
   - Add hover states
   - Implement loading feedback
   - Smooth transitions

### 🟢 Nice to Have (Polish)
4. **Improve Microcopy** (+0.3 score)
   - Consistent voice/tone
   - Better error messages
   - Stronger CTAs

5. **Add Delight** (+0.2 score)
   - Celebration animations
   - Personality touches
   - Memorable moments

**Potential Score: 9.2/10** if all improvements implemented
```

### Step 12: Detailed Report Option

```
## 📄 Detailed Report Available

Would you like me to:
1. Generate detailed PDF report
2. Export issues to task tracker
3. Create improvement checklist
4. Show code examples for fixes
5. Run continuous monitoring

Type the number or 'skip' to finish.
```

## Scoring Methodology

### Scoring Rubric
```yaml
scoring:
  10: "Perfect - Industry-leading quality"
  9:  "Excellent - Minor improvements only"
  8:  "Great - Few issues, well-executed"
  7:  "Good - Solid foundation, some gaps"
  6:  "Acceptable - Meets basics, needs work"
  5:  "Poor - Many issues, significant gaps"
  <5: "Critical - Major problems throughout"

weights:
  accessibility: 0.20      # Most important
  visual_consistency: 0.15
  design_system: 0.15
  interactivity: 0.15
  performance: 0.10
  responsive: 0.10
  microcopy: 0.10
  delight: 0.05           # Nice to have
```

### Automated Scoring Logic
```javascript
const calculateScore = (metrics) => {
  const scores = {
    visualConsistency: assessVisualConsistency(metrics),
    designSystem: assessTokenUsage(metrics),
    accessibility: assessA11y(metrics),
    interactivity: assessInteractions(metrics),
    microcopy: assessContent(metrics),
    performance: assessPerformance(metrics),
    responsive: assessResponsive(metrics),
    delight: assessDelight(metrics)
  };
  
  const weighted = Object.entries(scores).reduce((total, [key, score]) => {
    return total + (score * weights[key]);
  }, 0);
  
  return {
    overall: weighted,
    breakdown: scores,
    grade: getGrade(weighted)
  };
};
```

## Integration Examples

### CI/CD Integration
```yaml
# .github/workflows/ui-quality.yml
name: UI Quality Check
on: [pull_request]

jobs:
  ui-score:
    runs-on: ubuntu-latest
    steps:
      - name: Run UI Score
        id: score
        run: |
          score=$(baco ui-score --quick --export)
          echo "::set-output name=score::$score"
      
      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            const score = ${{ steps.score.outputs.score }};
            const emoji = score >= 8 ? '✅' : score >= 6 ? '⚠️' : '❌';
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              body: `${emoji} UI Quality Score: ${score}/10\n\nRun \`/ui-score --detailed\` for breakdown.`
            })
      
      - name: Fail if below threshold
        if: steps.score.outputs.score < 6
        run: exit 1
```

### Monitoring Dashboard
```javascript
// Track UI quality over time
const uiQualityTrends = {
  track: async () => {
    const score = await runUIScore();
    
    await db.insert('ui_scores', {
      timestamp: new Date(),
      overall: score.overall,
      breakdown: score.breakdown,
      commit: getCurrentCommit(),
      branch: getCurrentBranch()
    });
    
    // Alert on degradation
    if (score.overall < previousScore - 0.5) {
      await notifyTeam('UI Quality Degradation Detected', score);
    }
  }
};
```

## Example Outputs

### Quick Score
```
UI Score: 7.4/10 (B+)
Run with --detailed for full breakdown
```

### Comparison Mode
```
UI Score Comparison:
Current:  7.4/10 (B+) ↑
Baseline: 6.2/10 (C+)
Change:   +1.2 (19% improvement)

Biggest gains:
- Accessibility: +1.5
- Interactivity: +0.8
- Visual Consistency: +0.6
```