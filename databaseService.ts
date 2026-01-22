
import { FollowUp, AutomationRule, Template } from './types';

const STORAGE_KEY = 'noreply_pro_db_v2';
const RULES_KEY = 'noreply_pro_rules_v2';
const TEMPLATES_KEY = 'noreply_pro_templates_v2';

export const databaseService = {
  async getFollowUps(): Promise<FollowUp[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to fetch follow-ups", e);
      return [];
    }
  },

  async saveFollowUp(item: FollowUp): Promise<void> {
    const items = await this.getFollowUps();
    const index = items.findIndex(f => f.id === item.id);
    if (index > -1) {
      items[index] = item;
    } else {
      items.unshift(item);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },

  async deleteFollowUp(id: string): Promise<void> {
    const items = await this.getFollowUps();
    const filtered = items.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  async getRules(): Promise<AutomationRule[]> {
    try {
      const data = localStorage.getItem(RULES_KEY);
      if (data) return JSON.parse(data);
      
      const defaultRules: AutomationRule[] = [
        { id: '1', name: 'Standard 3-Day Ping', triggerDays: 3, tone: 'polite', enabled: true },
        { id: '2', name: 'Urgent 7-Day Push', triggerDays: 7, tone: 'urgent', enabled: false }
      ];
      localStorage.setItem(RULES_KEY, JSON.stringify(defaultRules));
      return defaultRules;
    } catch (e) {
      return [];
    }
  },

  async saveRule(rule: AutomationRule): Promise<void> {
    const rules = await this.getRules();
    const index = rules.findIndex(r => r.id === rule.id);
    if (index > -1) {
      rules[index] = rule;
    } else {
      rules.push(rule);
    }
    localStorage.setItem(RULES_KEY, JSON.stringify(rules));
  },

  async deleteRule(id: string): Promise<void> {
    const rules = await this.getRules();
    const filtered = rules.filter(r => r.id !== id);
    localStorage.setItem(RULES_KEY, JSON.stringify(filtered));
  },

  async getTemplates(): Promise<Template[]> {
    try {
      const data = localStorage.getItem(TEMPLATES_KEY);
      if (data) return JSON.parse(data);
      const defaults: Template[] = [
        { id: '1', name: 'Standard Follow-up', content: 'Hi [Name], just checking in on our previous conversation.', tone: 'polite' }
      ];
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(defaults));
      return defaults;
    } catch (e) {
      return [];
    }
  },

  async saveTemplate(template: Template): Promise<void> {
    const items = await this.getTemplates();
    const index = items.findIndex(t => t.id === template.id);
    if (index > -1) {
      items[index] = template;
    } else {
      items.push(template);
    }
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(items));
  },

  async deleteTemplate(id: string): Promise<void> {
    const items = await this.getTemplates();
    const filtered = items.filter(t => t.id !== id);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
  },

  async clearAll(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RULES_KEY);
    localStorage.removeItem(TEMPLATES_KEY);
  },

  async exportAll(): Promise<string> {
    const data = {
      followUps: await this.getFollowUps(),
      rules: await this.getRules(),
      templates: await this.getTemplates(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }
};
