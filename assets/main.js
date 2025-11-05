const stageDescriptions = {
  awareness: 'Build omnichannel reach with paid social, influencer partnerships, and hero content hubs.',
  consideration: 'Drive mid-funnel intent with progressive profiling, comparison guides, and nurture sequences.',
  conversion: 'Optimize acquisition moments with CRO testing, sales enablement, and automated onboarding.',
  retention: 'Expand lifetime value through loyalty programs, lifecycle messaging, and advocacy campaigns.',
};

const stageKpis = {
  awareness: 'Primary KPIs: reach, CPM efficiency, and top-of-funnel CTR.',
  consideration: 'Primary KPIs: MQL velocity, content engagement depth, and remarketing lift.',
  conversion: 'Primary KPIs: CAC trendline, pipeline velocity, and on-site conversion rate.',
  retention: 'Primary KPIs: repeat purchase rate, churn reduction, and NPS elevation.',
};

function queryElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Element not found for selector: ${selector}`);
  }
  return element;
}

function readFunnelConfig(form) {
  const formData = new FormData(form);
  const stages = formData.getAll('stage').map((value) => value.toString());
  return {
    business: formData.get('business')?.toString().trim() ?? '',
    industry: formData.get('industry')?.toString().trim() ?? '',
    sessions: Number(formData.get('sessions') ?? 0),
    cpa: Number(formData.get('cpa') ?? 0),
    stages: stages.length > 0 ? stages : ['awareness', 'consideration', 'conversion'],
    newsletter: formData.get('newsletter') === 'on',
  };
}

function persistConfig(config) {
  try {
    localStorage.setItem('foxytrailz23:funnel', JSON.stringify(config));
  } catch (error) {
    console.warn('Unable to persist funnel configuration', error);
  }
}

function loadConfig() {
  try {
    const raw = localStorage.getItem('foxytrailz23:funnel');
    return raw ? JSON.parse(raw) : undefined;
  } catch (error) {
    console.warn('Unable to load funnel configuration', error);
    return undefined;
  }
}

function renderFunnelSnapshot(config) {
  const container = queryElement('#funnel-plan-output');
  container.replaceChildren();

  const heading = document.createElement('dt');
  heading.textContent = `${config.business || 'Your brand'} funnel overview`;
  container.append(heading);

  const summary = document.createElement('dd');
  summary.textContent = `Industry focus: ${config.industry || 'General'} | Monthly sessions: ${config.sessions.toLocaleString()} | Target CPA: $${config.cpa.toFixed(0)}`;
  container.append(summary);

  config.stages.forEach((stage) => {
    const stageTitle = document.createElement('dt');
    stageTitle.textContent = stage.charAt(0).toUpperCase() + stage.slice(1);
    container.append(stageTitle);

    const stageDetail = document.createElement('dd');
    stageDetail.textContent = `${stageDescriptions[stage]} ${stageKpis[stage]}`;
    container.append(stageDetail);
  });

  const nurture = document.createElement('dd');
  nurture.textContent = config.newsletter
    ? 'Weekly insight digest activated. You will receive optimization briefs straight to your inbox.'
    : 'Newsletter insights skipped. Add email sync to stay aligned with funnel experiments.';
  container.append(nurture);
}

function setupNavigation() {
  const toggle = queryElement('.nav-toggle');
  const links = queryElement('.nav-links');

  const updateState = (expanded) => {
    toggle.setAttribute('aria-expanded', String(expanded));
    links.dataset.open = expanded ? 'true' : 'false';
  };

  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    updateState(!isExpanded);
  });

  links.querySelectorAll('a').forEach((anchor) => {
    anchor.addEventListener('click', () => updateState(false));
  });

  updateState(false);
}

function setupAnalysisForm() {
  const form = queryElement('#analysis-form');
  const feedback = queryElement('#analysis-feedback');

  const syncFormWithConfig = (config) => {
    queryElement('#business-name').value = config.business;
    queryElement('#industry').value = config.industry;
    queryElement('#traffic-level').value = config.sessions.toString();
    queryElement('#goal-cpa').value = config.cpa.toString();
    queryElement('#newsletter').checked = config.newsletter;

    const stageInputs = form.querySelectorAll('input[name="stage"]');
    stageInputs.forEach((input) => {
      input.checked = config.stages.includes(input.value);
    });
  };

  const updateOutput = () => {
    const config = readFunnelConfig(form);
    renderFunnelSnapshot(config);
  };

  const stored = loadConfig();
  if (stored) {
    syncFormWithConfig(stored);
    renderFunnelSnapshot(stored);
  } else {
    updateOutput();
  }

  form.addEventListener('input', () => {
    updateOutput();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const config = readFunnelConfig(form);
    renderFunnelSnapshot(config);
    persistConfig(config);
    feedback.textContent = 'Plan summary generated and saved. We will tailor the analytics rollout for you.';
    window.setTimeout(() => {
      feedback.textContent = '';
    }, 6000);
  });
}

function setupCallForm() {
  const callForm = queryElement('#call-form');
  const feedback = queryElement('#call-feedback');

  callForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(callForm);
    const name = formData.get('name')?.toString() ?? 'there';
    feedback.textContent = `Thanks ${name}, your strategy call request is locked in. Expect a confirmation email shortly.`;
    callForm.reset();
  });
}

function setupDownloadBrief() {
  const button = queryElement('#download-brief');
  button.addEventListener('click', () => {
    const config = loadConfig() ?? readFunnelConfig(queryElement('#analysis-form'));
    const lines = [
      'FoxyTrailz23 Growth Brief',
      `Business: ${config.business || 'Not specified'}`,
      `Industry: ${config.industry || 'Not specified'}`,
      `Monthly Sessions: ${config.sessions.toLocaleString()}`,
      `Target CPA: $${config.cpa.toFixed(0)}`,
      `Stages: ${config.stages.join(', ')}`,
      `Newsletter Sync: ${config.newsletter ? 'Enabled' : 'Disabled'}`,
      '',
      'Stage Strategy:',
      ...config.stages.map((stage) => `${stage.toUpperCase()}: ${stageDescriptions[stage]}`),
      '',
      'KPIs:',
      ...config.stages.map((stage) => `${stage.toUpperCase()}: ${stageKpis[stage]}`),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'foxytrailz23-growth-brief.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  });
}

function setCurrentYear() {
  const yearElement = queryElement('#year');
  yearElement.textContent = new Date().getFullYear().toString();
}

function bootstrap() {
  setupNavigation();
  setupAnalysisForm();
  setupCallForm();
  setupDownloadBrief();
  setCurrentYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
