'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    BookOpen,
    Zap,
    Users,
    TrendingUp,
    Target,
    HelpCircle,
    FileText,
    Video,
    MessageCircle
} from "lucide-react";

export default function DocsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const quickLinks = [
        { icon: Zap, title: 'Quick Start', description: 'Get started in 3 steps', href: '#quick-start' },
        { icon: Users, title: 'Team Guide', description: 'Collaborate with your team', href: '#team' },
        { icon: TrendingUp, title: 'Pipeline Management', description: 'Manage your sales pipeline', href: '#pipeline' },
        { icon: Target, title: 'Lead Scoring', description: 'Prioritize your leads', href: '#scoring' },
    ];

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <BookOpen className="h-8 w-8 text-primary" />
                    <h1 className="text-4xl font-bold tracking-tight">Help Center</h1>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Everything you need to know about managing leads and growing your business with Kima CRM
                </p>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search documentation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {quickLinks.map((link, i) => (
                    <a key={i} href={link.href} className="group">
                        <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                            <CardContent className="pt-6">
                                <link.icon className="h-8 w-8 text-primary mb-3" />
                                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                                    {link.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {link.description}
                                </p>
                            </CardContent>
                        </Card>
                    </a>
                ))}
            </div>

            <section className="grid gap-6">
                {/* What is Kima CRM */}
                <Card id="about" className="border-primary/50 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <FileText className="h-6 w-6" />
                            What is Kima CRM?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p>
                            Kima CRM is a modern customer relationship management system designed specifically for businesses operating in both traditional (Web2) and blockchain (Web3) markets. Built for speed and clarity, it helps you manage global business leads with a focus on currency flow and successful onboarding.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="exporter">Web2 Support</Badge>
                            <Badge variant="wallet">Web3 Native</Badge>
                            <Badge variant="demo">Pipeline Management</Badge>
                            <Badge variant="onboarded">Lead Scoring</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Start */}
                <div id="quick-start" className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-primary" />
                                Quick Start (3 Steps)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                    1
                                </div>
                                <div>
                                    <p className="font-semibold">Add a Lead</p>
                                    <p className="text-muted-foreground">Go to Leads → Add Lead. Enter the company info.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                    2
                                </div>
                                <div>
                                    <p className="font-semibold">Move to Pipeline</p>
                                    <p className="text-muted-foreground">Drag the lead into &quot;Contacted&quot; or &quot;Demo Scheduled&quot;.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                    3
                                </div>
                                <div>
                                    <p className="font-semibold">Onboard</p>
                                    <p className="text-muted-foreground">Once the deal is closed, change status to &quot;Onboarded&quot;.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Daily Workflow
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <p className="font-semibold">🌅 Morning</p>
                                <p className="text-muted-foreground">Check &quot;Due Today&quot; follow-ups and prioritize your day.</p>
                            </div>
                            <div>
                                <p className="font-semibold">☀️ Midday</p>
                                <p className="text-muted-foreground">Update status of demos performed and add notes.</p>
                            </div>
                            <div>
                                <p className="font-semibold">🌙 Evening</p>
                                <p className="text-muted-foreground">Review pipeline and add notes for tomorrow&apos;s priorities.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pipeline Stages */}
                <Card id="pipeline">
                    <CardHeader>
                        <CardTitle>Pipeline Stages Explained</CardTitle>
                        <CardDescription>Understanding the sales journey</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="p-3 border rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="new">New</Badge>
                                    <span className="font-semibold">New Lead</span>
                                </div>
                                <p className="text-muted-foreground">Freshly added to the system, awaiting initial contact.</p>
                            </div>
                            <div className="p-3 border rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="contacted">Contacted</Badge>
                                    <span className="font-semibold">Contacted</span>
                                </div>
                                <p className="text-muted-foreground">Initial outreach completed, conversation started.</p>
                            </div>
                            <div className="p-3 border rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="demo">Demo Scheduled</Badge>
                                    <span className="font-semibold">Demo Scheduled</span>
                                </div>
                                <p className="text-muted-foreground">Product demonstration scheduled or completed.</p>
                            </div>
                            <div className="p-3 border rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="negotiation">Negotiation</Badge>
                                    <span className="font-semibold">Negotiation</span>
                                </div>
                                <p className="text-muted-foreground">Discussing terms, pricing, and contract details.</p>
                            </div>
                            <div className="p-3 border rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="onboarded">Onboarded</Badge>
                                    <span className="font-semibold">Onboarded</span>
                                </div>
                                <p className="text-muted-foreground">Deal closed! Customer successfully onboarded.</p>
                            </div>
                            <div className="p-3 border rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="lost">Lost</Badge>
                                    <span className="font-semibold">Lost</span>
                                </div>
                                <p className="text-muted-foreground">Deal didn&apos;t close. Document reasons for learning.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lead Segments */}
                <Card id="segments">
                    <CardHeader>
                        <CardTitle>Lead Segments</CardTitle>
                        <CardDescription>Web2 vs Web3 classification</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Badge variant="exporter">Web2</Badge>
                                Traditional Businesses
                            </h4>
                            <div className="grid gap-2 md:grid-cols-2 ml-4">
                                <div>
                                    <p className="font-medium">Exporters</p>
                                    <p className="text-muted-foreground">International trade companies</p>
                                </div>
                                <div>
                                    <p className="font-medium">Freelancers</p>
                                    <p className="text-muted-foreground">Independent contractors and consultants</p>
                                </div>
                                <div>
                                    <p className="font-medium">Agencies</p>
                                    <p className="text-muted-foreground">Service-based businesses</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Badge variant="wallet">Web3</Badge>
                                Crypto-Native Entities
                            </h4>
                            <div className="grid gap-2 md:grid-cols-2 ml-4">
                                <div>
                                    <p className="font-medium">Wallets</p>
                                    <p className="text-muted-foreground">Cryptocurrency wallet providers</p>
                                </div>
                                <div>
                                    <p className="font-medium">dApps</p>
                                    <p className="text-muted-foreground">Decentralized applications</p>
                                </div>
                                <div>
                                    <p className="font-medium">Payments Infrastructure</p>
                                    <p className="text-muted-foreground">Blockchain payment solutions</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lead Scoring */}
                <Card id="scoring">
                    <CardHeader>
                        <CardTitle>Lead Scoring Rules</CardTitle>
                        <CardDescription>How we prioritize outreach</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-3">
                        <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <span className="font-medium">Web3 Native (Wallet/dApp)</span>
                            <Badge variant="demo" className="font-bold">+30 pts</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <span className="font-medium">High Currency Flow ({`>`}$1M)</span>
                            <Badge variant="demo" className="font-bold">+25 pts</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <span className="font-medium">Decision Maker Contacted</span>
                            <Badge variant="demo" className="font-bold">+20 pts</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <span className="font-medium">Active Engagement</span>
                            <Badge variant="demo" className="font-bold">+15 pts</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <span className="font-medium">Referral Source</span>
                            <Badge variant="demo" className="font-bold">+10 pts</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* FAQs */}
                <div id="faqs">
                    <div className="flex items-center gap-2 mb-4">
                        <HelpCircle className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How do I add a new lead?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                Navigate to the &quot;Leads&quot; page and click the &quot;Add Lead&quot; button in the top right corner. Fill in the required information including company name, contact details, and segment. You can also import multiple leads at once using the CSV import feature.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How do I mark a customer as onboarded?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                Open the lead profile or find the lead card in the pipeline view. Change the status dropdown to &quot;Onboarded&quot;. The lead will automatically appear in the &quot;Closed Customers&quot; list and be removed from active pipeline stages.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>What is the difference between Web2 and Web3 segments?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                Web2 leads are traditional businesses like Exporters, Freelancers, and Agencies that operate in conventional markets. Web3 leads are crypto-native entities such as Wallets, dApps, and Blockchain Infrastructure providers that operate in the decentralized ecosystem.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>How does lead scoring work?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                Lead scoring automatically assigns points based on various factors like segment type, currency flow volume, engagement level, and contact quality. Higher scores indicate leads that should be prioritized for outreach. You can view each lead&apos;s score in the leads table and use it to filter and sort your pipeline.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>Can I customize pipeline stages?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                The default pipeline stages (New, Contacted, Demo Scheduled, Negotiation, Onboarded, Lost) are optimized for most sales processes. For custom stage requirements, please contact your administrator or reach out to support.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6">
                            <AccordionTrigger>How do I set up follow-up reminders?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                When viewing a lead profile, you can set a &quot;Next Follow-up Date&quot; in the lead details. The system will automatically remind you on the Follow-ups page when the date arrives. You can also enable email notifications in Settings to receive reminders directly in your inbox.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                {/* Additional Resources */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Need More Help?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-3">
                            <div className="p-4 border rounded-lg text-center">
                                <Video className="h-8 w-8 text-primary mx-auto mb-2" />
                                <p className="font-semibold mb-1">Video Tutorials</p>
                                <p className="text-xs text-muted-foreground">Watch step-by-step guides</p>
                            </div>
                            <div className="p-4 border rounded-lg text-center">
                                <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                                <p className="font-semibold mb-1">Live Chat</p>
                                <p className="text-xs text-muted-foreground">Chat with our support team</p>
                            </div>
                            <div className="p-4 border rounded-lg text-center">
                                <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                                <p className="font-semibold mb-1">Documentation</p>
                                <p className="text-xs text-muted-foreground">Detailed technical docs</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
