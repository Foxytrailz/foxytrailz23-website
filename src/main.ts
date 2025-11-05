/**
 * Stage keys supported across the funnel experience.
 */
type StageKey = 'awareness' | 'consideration' | 'conversion' | 'retention';

/**
 * Funnel configuration captured from the discovery form.
 */
interface FunnelConfig {
  business: string;
  industry: string;
  sessions: number;
  cpa: number;
  stages: StageKey[];
  newsletter: boolean;
}

/**
 * Mapping of funnel stages to their positioning copy.
 */
const stageDescriptions: Record<StageKey, string> = {
  awareness: 'Build omnichannel reach with paid social, influencer partnerships, and hero content hubs.',
  consideration: 'Drive mid-funnel intent with progressive profiling, comparison guides, and nurture sequences.',
  conversion: 'Optimize acquisition moments with CRO testing, sales enablement, and automated onboarding.',
  retention: 'Expand lifetime value through loyalty programs, lifecycle messaging, and advocacy campaigns.',
};

/**
 * KPI focus per funnel stage.
 */
const stageKpis: Record<StageKey, string> = {
  awareness: 'Primary KPIs: reach, CPM efficiency, and top-of-funnel CTR.',
  consideration: 'Primary KPIs: MQL velocity, content engagement depth, and remarketing lift.',
  conversion: 'Primary KPIs: CAC trendline, pipeline velocity, and on-site conversion rate.',
  retention: 'Primary KPIs: repeat purchase rate, churn reduction, and NPS elevation.',
};

/**
 * Retrieve a typed DOM element by CSS selector.
 * @param selector - The CSS selector to query.
 * @returns The matching element cast to the requested HTMLElement subtype.
 */
function queryElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Element not found for selector: ${selector}`);
  }
  return element as T;
}

/**
 * Serialize the analysis form into a funnel configuration object.
 * @param form - The analysis form element.
 * @returns A fully typed funnel configuration.
 */
function readFunnelConfig(form: HTMLFormElement): FunnelConfig {
  const formData = new FormData(form);
  const stages = formData.getAll('stage').map((value) => value.toString() as StageKey);
  return {
    business: formData.get('business')?.toString().trim() ?? '',
    industry: formData.get('industry')?.toString().trim() ?? '',
    sessions: Number(formData.get('sessions') ?? 0),
    cpa: Number(formData.get('cpa') ?? 0),
    stages: stages.length > 0 ? stages : ['awareness', 'consideration', 'conversion'],
    newsletter: formData.get('newsletter') === 'on',
  };
}

/**
 * Persist the funnel configuration for quick reloads.
 * @param config - Configuration to persist.
 */
function persistConfig(config: FunnelConfig): void {
  try {
    localStorage.setItem('foxytrailz23:funnel', JSON.stringify(config));
  } catch (error) {
    console.warn('Unable to persist funnel configuration', error);
  }
}

/**
 * Load the persisted configuration from storage.
 * @returns The stored funnel config or undefined.
 */
function loadConfig(): FunnelConfig | undefined {
  try {
    const raw = localStorage.getItem('foxytrailz23:funnel');
    return raw ? (JSON.parse(raw) as FunnelConfig) : undefined;
  } catch (error) {
    console.warn('Unable to load funnel configuration', error);
    return undefined;
  }
}

/**
 * Render the funnel snapshot section with the current configuration.
 * @param config - Configuration to display.
 */
function renderFunnelSnapshot(config: FunnelConfig): void {
  const container = queryElement<HTMLDListElement>('#funnel-plan-output');
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

/**
 * Attach responsive navigation behavior.
 */
function setupNavigation(): void {
  const toggle = queryElement<HTMLButtonElement>('.nav-toggle');
  const links = queryElement<HTMLUListElement>('.nav-links');

  const updateState = (expanded: boolean): void => {
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

/**
 * Initialize the analysis form interactions.
 */
function setupAnalysisForm(): void {
  const form = queryElement<HTMLFormElement>('#analysis-form');
  const feedback = queryElement<HTMLParagraphElement>('#analysis-feedback');

  const syncFormWithConfig = (config: FunnelConfig): void => {
    queryElement<HTMLInputElement>('#business-name').value = config.business;
    queryElement<HTMLInputElement>('#industry').value = config.industry;
    queryElement<HTMLInputElement>('#traffic-level').value = config.sessions.toString();
    queryElement<HTMLInputElement>('#goal-cpa').value = config.cpa.toString();
    queryElement<HTMLInputElement>('#newsletter').checked = config.newsletter;

    const stageInputs = form.querySelectorAll<HTMLInputElement>('input[name="stage"]');
    stageInputs.forEach((input) => {
      input.checked = config.stages.includes(input.value as StageKey);
    });
  };

  const updateOutput = (): void => {
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

/**
 * Handle the call scheduling form submission with graceful acknowledgement.
 */
function setupCallForm(): void {
  const callForm = queryElement<HTMLFormElement>('#call-form');
  const feedback = queryElement<HTMLParagraphElement>('#call-feedback');

  callForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(callForm);
    const name = formData.get('name')?.toString() ?? 'there';
    feedback.textContent = `Thanks ${name}, your strategy call request is locked in. Expect a confirmation email shortly.`;
    callForm.reset();
  });
}

/**
 * Generate and download a growth brief text file summarizing the funnel.
 */
function setupDownloadBrief(): void {
  const button = queryElement<HTMLButtonElement>('#download-brief');
  button.addEventListener('click', () => {
    const config = loadConfig() ?? readFunnelConfig(queryElement<HTMLFormElement>('#analysis-form'));
    const lines = [
      `FoxyTrailz23 Growth Brief`,
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

/**
 * Stamp the current year into the footer.
 */
function setCurrentYear(): void {
  const yearElement = queryElement<HTMLSpanElement>('#year');
  yearElement.textContent = new Date().getFullYear().toString();
}

/**
 * Initialize all interactive modules on DOM ready.
 */
function bootstrap(): void {
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
