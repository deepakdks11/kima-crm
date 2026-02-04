import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function DocsPage() {
    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Help Center</h1>
                <p className="text-xl text-muted-foreground italic">Simplicity is the ultimate sophistication.</p>
            </div>

            <section className="grid gap-6">
                <Card className="bg-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle className="text-2xl">What is this CRM?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        The Trustodi + Kima CRM is built for speed and clarity. It helps you manage global business leads across Web2 and Web3 segments with a focus on currency flow and onboarding.
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Start (3 Steps)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><strong>1. Add a Lead:</strong> Go to Leads → Add Lead. Enter the company info.</p>
                            <p><strong>2. Move to Pipeline:</strong> Drag the lead into "Contacted" or "Demo Scheduled".</p>
                            <p><strong>3. Onboard:</strong> Once the deal is closed, change status to "Onboarded".</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Workflow</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><strong>Morning:</strong> Check "Due Today" follow-ups.</p>
                            <p><strong>Midday:</strong> Update status of demos performed.</p>
                            <p><strong>Evening:</strong> Add notes for tomorrow's priorities.</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Lead Scoring Rules</CardTitle>
                        <CardDescription>How we prioritize outreach</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span>Web3 Native (Wallet/dApp)</span>
                            <span className="font-bold text-green-500">+30 pts</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span>High Currency Flow ({`>`}$1M)</span>
                            <span className="font-bold text-green-500">+25 pts</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span>Decision Maker Contacted</span>
                            <span className="font-bold text-green-500">+20 pts</span>
                        </div>
                    </CardContent>
                </Card>

                <div>
                    <h2 className="text-2xl font-bold mb-4">FAQs</h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How do I add a new lead?</AccordionTrigger>
                            <AccordionContent>
                                Simply navigate to the "Leads" tab and click the "Add Lead" button at the top right.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How do I mark a customer as onboarded?</AccordionTrigger>
                            <AccordionContent>
                                Open the lead profile or pipeline card and change the status to "Onboarded". The lead will automatically appear in the "Closed Customers" list.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>What is the difference between Web2 and Web3 segments?</AccordionTrigger>
                            <AccordionContent>
                                Web2 leads are traditional businesses (Exporters, Freelancers). Web3 leads are crypto-native entities (Wallets, dApps, Infrastructure).
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>
        </div>
    );
}
