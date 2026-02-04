
import { Lead } from './types';

export function calculateLeadScore(lead: Partial<Lead>): number {
    let score = 0;

    // Segment Rules
    // +20 if Exporter or Wallet
    if (lead.sub_segment === 'Exporter' || lead.sub_segment === 'Wallet') {
        score += 20;
    }

    // +20 High Volume (simulated check on use_case or just heuristic)
    if (lead.use_case?.toLowerCase().includes('high volume')) {
        score += 20;
    }

    // +15 INR Settlement (currency_flow)
    if (lead.currency_flow?.includes('INR')) {
        score += 15;
    }

    // +15 On-ramp required
    if (lead.use_case?.toLowerCase().includes('on-ramp')) {
        score += 15;
    }

    // +10 if Decision maker filled
    if (lead.decision_maker_name && lead.decision_maker_name.length > 0) {
        score += 10;
    }

    // +20 if Status = Responded/Demo
    if (['Contacted', 'Demo Scheduled', 'Negotiation', 'Onboarded'].includes(lead.status || '')) {
        score += 20;
    }

    return Math.min(score, 100);
}
