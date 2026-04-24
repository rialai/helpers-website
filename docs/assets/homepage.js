const principles = [
  {
    title: "No upfront marketing cost",
    text: "The cooperative funds and sets up the client supply process before asking for any share from completed work."
  },
  {
    title: "Aligned incentives",
    text: "Helpers.ie earns after client service is completed, so both sides depend on practical, real delivery."
  },
  {
    title: "Transparent operations",
    text: "Members use a shared system to record service delivery and business processes clearly."
  },
  {
    title: "Priority follows contribution",
    text: "Members stay in the network even without contribution, but active growth focus is directed to contributors."
  }
];

const steps = [
  "We assess your business type, service capacity, and growth constraints.",
  "We design and fund a client supply process for your specific operation.",
  "You serve incoming clients through your normal delivery workflow.",
  "You record service delivery and operations in the provided system.",
  "You return a share from completed deals and improve internal priority over time."
];

const benefits = [
  {
    title: "Funded client acquisition setup",
    text: "A structured process is built and financed by the cooperative."
  },
  {
    title: "Process design",
    text: "You get a practical delivery path tailored to your business type."
  },
  {
    title: "Operational system",
    text: "Shared ERP and process tracking create clarity and accountability."
  },
  {
    title: "Network learning",
    text: "Members can learn from use cases and operator experience across the community."
  },
  {
    title: "Visibility in the cooperative",
    text: "Reliable operators become easier to identify and support faster."
  },
  {
    title: "Lower owner stress",
    text: "Acquisition and process pressure is shared with an operating partner."
  },
  {
    title: "Scalable support",
    text: "As quality and transparency rise, growth investment can be increased."
  }
];

const pricing = [
  {
    label: "Community level",
    contribution: "&euro;365/year",
    commission: "10% commission",
    details: "Voluntary contribution that reduces commission while maintaining active participation."
  },
  {
    label: "Growth level",
    contribution: "&euro;3,650/year",
    commission: "1% commission",
    details: "Lower ongoing commission and stronger growth prioritization for sustained contributors.",
    featured: true
  },
  {
    label: "Partner level",
    contribution: "&euro;36,500/year",
    commission: "0% commission",
    details: "No commission rate; priority may also consider number of paid years at this level."
  }
];

const priorityLogic = [
  "Quality of service delivery",
  "Low client conflict and responsible issue handling",
  "Transparent process records in the shared system",
  "Timely return of commission from completed deals",
  "Ongoing membership contribution",
  "History of paid years at higher contribution levels"
];

const goodFit = [
  "Businesses with real service capacity",
  "Owners willing to follow a structured process",
  "Transparent operators who can document work",
  "Teams ready to serve more clients reliably"
];

const notFit = [
  "Businesses that mistreat clients",
  "Operators seeking demand without accountability",
  "Teams unwilling to use the provided system",
  "Businesses unwilling to record completed work"
];

const cases = [
  {
    type: "Local cleaning team",
    challenge: "Demand was inconsistent and lead quality varied weekly.",
    changed: "Introduced a funded intake funnel and standardized service logging.",
    result: "More stable booking flow and fewer missed handovers in daily operations."
  },
  {
    type: "Independent handyman",
    challenge: "Had delivery skill but no repeatable client acquisition process.",
    changed: "Set up channel mix, booking rules, and process tracking in one system.",
    result: "Improved scheduling reliability and clearer visibility on completed jobs."
  },
  {
    type: "Small tutoring studio",
    challenge: "Growth stalled due to manual follow-ups and unclear service records.",
    changed: "Added process templates, shared dashboard, and contribution-based support.",
    result: "Higher continuity of student intake and smoother internal coordination."
  }
];

const faqs = [
  {
    q: "What does Helpers.ie actually do?",
    a: "Helpers.ie designs, sets up, and funds a client supply process for microbusinesses, then supports operations through shared process tracking."
  },
  {
    q: "Who pays for marketing and setup?",
    a: "The cooperative covers setup and client supply costs upfront."
  },
  {
    q: "When do I pay?",
    a: "Compensation starts after you complete client work that came through the cooperative process."
  },
  {
    q: "Is membership required?",
    a: "Membership contribution is voluntary. It lowers commission and affects support priority, but is not required to remain in the network."
  },
  {
    q: "What happens if I do not contribute?",
    a: "You stay in the cooperative community, can communicate with members, and can follow use cases. Active growth effort is focused on contributors."
  },
  {
    q: "Why does contribution affect priority?",
    a: "Contribution sustains the cooperative system. Priority follows members who help maintain and expand shared growth capacity."
  },
  {
    q: "Do I have to use the provided system?",
    a: "Yes. Transparent process records are required to maintain fairness, quality control, and reliable support decisions."
  },
  {
    q: "What if a client is unhappy?",
    a: "Client issues are handled through documented review. Conflict handling quality influences future internal priority."
  },
  {
    q: "How do you determine commission?",
    a: "Commission is linked to completed deals delivered through the cooperative process and adjusted by your contribution level."
  },
  {
    q: "Can I stay in the cooperative without active growth support?",
    a: "Yes. You may remain in the network even if active growth effort is directed to contributing members."
  }
];

function renderCards(targetId, items, itemRenderer) {
  const root = document.getElementById(targetId);
  if (!root) return;
  root.innerHTML = items.map(itemRenderer).join("");
}

renderCards("principles-grid", principles, (item) => `
  <article class="card reveal">
    <h3>${item.title}</h3>
    <p>${item.text}</p>
  </article>
`);

renderCards("steps-list", steps, (item) => `
  <li class="step reveal">${item}</li>
`);

renderCards("benefits-grid", benefits, (item) => `
  <article class="card reveal">
    <h3>${item.title}</h3>
    <p>${item.text}</p>
  </article>
`);

renderCards("pricing-grid", pricing, (item) => `
  <article class="price-card ${item.featured ? "featured" : ""} reveal">
    <div class="price-label">${item.label}</div>
    <p class="price-value">${item.contribution}</p>
    <p class="price-commission">${item.commission}</p>
    <p class="section-copy">${item.details}</p>
  </article>
`);

renderCards("priority-list", priorityLogic, (item) => `
  <li>${item}</li>
`);

renderCards("good-fit-list", goodFit, (item) => `<li>${item}</li>`);
renderCards("not-fit-list", notFit, (item) => `<li>${item}</li>`);

renderCards("cases-grid", cases, (item) => `
  <article class="card reveal">
    <div class="case-meta">${item.type}</div>
    <h3>Challenge</h3>
    <p>${item.challenge}</p>
    <h3 style="margin-top: 12px;">What changed</h3>
    <p>${item.changed}</p>
    <p class="case-result">Result: ${item.result}</p>
  </article>
`);

renderCards("faq-list", faqs, (item, idx) => `
  <article class="faq-item reveal">
    <button class="faq-question" aria-expanded="false" aria-controls="faq-answer-${idx}" id="faq-question-${idx}">
      <span>${item.q}</span>
      <span aria-hidden="true">+</span>
    </button>
    <p class="faq-answer" id="faq-answer-${idx}" role="region" aria-labelledby="faq-question-${idx}" hidden>${item.a}</p>
  </article>
`);

document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    const answerId = button.getAttribute("aria-controls");
    const answer = answerId ? document.getElementById(answerId) : null;
    if (!answer) return;
    button.setAttribute("aria-expanded", String(!expanded));
    button.querySelector("span:last-child").textContent = expanded ? "+" : "-";
    answer.hidden = expanded;
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12
  }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
