# Future research lab (saved for later)

This section was removed from the Home page on October 29, 2026. It is kept here for reference.

**Eyebrow:** Future research lab

**Heading:** Causal intelligence for complex dynamic systems

**Text:**

I will establish a research lab at the intersection of AI, data systems, and causality, focused on forecasting when data are sparse and dynamics are changing. The five-year agenda covers causal discovery under sparsity with LLM-based agents, time series foundation models pretrained on simulation ensembles, and open systems and benchmarks for causally-constrained streaming forecasting, with applications in public health, sustainability, and critical infrastructure. I am on the 2026–27 academic job market and welcome conversations with search committees and prospective collaborators.

**Button:** "See my publications" linking to `/publications.html`

## How to bring it back

The text is still in `contents/profile.json` under `"futureLab"`, and the section's code is still in
`src/components/FutureLab.tsx`. To show it again on the Home page, in `src/pages/Home.tsx`:

1. Add this line with the other imports at the top:
   `import FutureLab from '../components/FutureLab';`
2. Add `<FutureLab />` on its own line right after `<About />`.
