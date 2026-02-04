'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModeToggle } from '@/components/mode-toggle';
import { InviteMemberDialog } from '@/components/settings/invite-member-dialog';
import { DeleteConfirmationDialog } from '@/components/settings/delete-confirmation-dialog';
import { createClient } from '@/lib/supabase/client';
import {
    User,
    Users,
    Bell,
    Plug,
    Palette,
    CreditCard,
    Save,
    Trash2,
    Plus,
    Loader2
} from 'lucide-react';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    invited_at: string;
}

interface UserPreferences {
    email_notifications: boolean;
    followup_reminders: boolean;
    deal_stage_changes: boolean;
    new_lead_assignments: boolean;
    weekly_summary: boolean;
}

export default function SettingsPage() {
    const supabase = createClient();

    // Profile state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);

    // Team state
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [teamLoading, setTeamLoading] = useState(true);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
    const [deletingMember, setDeletingMember] = useState(false);

    // Preferences state
    const [preferences, setPreferences] = useState<UserPreferences>({
        email_notifications: true,
        followup_reminders: true,
        deal_stage_changes: true,
        new_lead_assignments: false,
        weekly_summary: false,
    });
    const [preferencesLoading, setPreferencesLoading] = useState(true);
    const [preferencesSaving, setPreferencesSaving] = useState(false);

    // Fetch profile on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    // Fetch team members on mount
    useEffect(() => {
        fetchTeamMembers();
    }, []);

    // Fetch preferences on mount
    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || '');

                const { data } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setFirstName(data.first_name || '');
                    setLastName(data.last_name || '');
                    setBio(data.bio || '');
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setProfileLoading(false);
        }
    };

    const saveProfile = async () => {
        setProfileSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    id: user.id,
                    first_name: firstName,
                    last_name: lastName,
                    bio: bio,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            // Show success (you can add toast notification here)
            console.log('Profile saved successfully');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile');
        } finally {
            setProfileSaving(false);
        }
    };

    const fetchTeamMembers = async () => {
        try {
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTeamMembers(data || []);
        } catch (error) {
            console.error('Error fetching team members:', error);
        } finally {
            setTeamLoading(false);
        }
    };

    const inviteTeamMember = async (name: string, email: string, role: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('You must be logged in to invite team members');

            const { error } = await supabase
                .from('team_members')
                .insert({
                    name,
                    email,
                    role,
                    invited_by: user.id
                });

            if (error) {
                console.error('Supabase error inviting member:', error);
                throw new Error(error.message || 'Database error occurred');
            }

            // Refresh team members list
            await fetchTeamMembers();
        } catch (error) {
            console.error('Error in inviteTeamMember:', error);
            throw error;
        }
    };

    const removeTeamMember = async (id: string) => {
        setDeletingMember(true);
        try {
            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Refresh team members list
            await fetchTeamMembers();
            setDeleteDialogOpen(false);
            setMemberToDelete(null);
        } catch (error) {
            console.error('Error removing team member:', error);
            alert('Failed to remove team member');
        } finally {
            setDeletingMember(false);
        }
    };

    const fetchPreferences = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (data) {
                setPreferences({
                    email_notifications: data.email_notifications,
                    followup_reminders: data.followup_reminders,
                    deal_stage_changes: data.deal_stage_changes,
                    new_lead_assignments: data.new_lead_assignments,
                    weekly_summary: data.weekly_summary,
                });
            }
        } catch (error) {
            console.error('Error fetching preferences:', error);
        } finally {
            setPreferencesLoading(false);
        }
    };

    const savePreferences = async () => {
        setPreferencesSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { error } = await supabase
                .from('user_preferences')
                .upsert({
                    user_id: user.id,
                    ...preferences,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            console.log('Preferences saved successfully');
        } catch (error) {
            console.error('Error saving preferences:', error);
            alert('Failed to save preferences');
        } finally {
            setPreferencesSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your account settings and preferences
                </p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="team" className="gap-2">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Team</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="hidden sm:inline">Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="integrations" className="gap-2">
                        <Plug className="h-4 w-4" />
                        <span className="hidden sm:inline">Integrations</span>
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="gap-2">
                        <Palette className="h-4 w-4" />
                        <span className="hidden sm:inline">Appearance</span>
                    </TabsTrigger>
                    <TabsTrigger value="account" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="hidden sm:inline">Account</span>
                    </TabsTrigger>
                </TabsList>

                {/* Profile Settings */}
                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your personal information and how others see you
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {profileLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4">
                                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-10 w-10 text-primary" />
                                        </div>
                                        <div>
                                            <Button variant="outline" size="sm" disabled>Upload Photo</Button>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                JPG, PNG or GIF. Max 2MB.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                placeholder="John"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                placeholder="Doe"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            value={email}
                                            disabled
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Email cannot be changed here
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            placeholder="Tell us about yourself..."
                                            rows={4}
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                        />
                                    </div>

                                    <Button onClick={saveProfile} disabled={profileSaving} className="gap-2">
                                        <Save className="h-4 w-4" />
                                        {profileSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Team Settings */}
                <TabsContent value="team" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>
                                Manage your team members and their roles
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button className="gap-2" onClick={() => setInviteDialogOpen(true)}>
                                <Plus className="h-4 w-4" />
                                Invite Team Member
                            </Button>

                            {teamLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : teamMembers.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No team members yet</p>
                                    <p className="text-sm">Invite your first team member to get started</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {teamMembers.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{member.name}</p>
                                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">{member.role}</span>
                                                {member.role !== 'Owner' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setMemberToDelete(member.id);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Settings */}
                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Choose how you want to be notified
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {preferencesLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <>
                                    {[
                                        {
                                            key: 'email_notifications' as keyof UserPreferences,
                                            label: 'Email Notifications',
                                            description: 'Receive email updates about your leads'
                                        },
                                        {
                                            key: 'followup_reminders' as keyof UserPreferences,
                                            label: 'Follow-up Reminders',
                                            description: 'Get reminded about upcoming follow-ups'
                                        },
                                        {
                                            key: 'deal_stage_changes' as keyof UserPreferences,
                                            label: 'Deal Stage Changes',
                                            description: 'Notify when a lead changes status'
                                        },
                                        {
                                            key: 'new_lead_assignments' as keyof UserPreferences,
                                            label: 'New Lead Assignments',
                                            description: 'Alert when a new lead is assigned to you'
                                        },
                                        {
                                            key: 'weekly_summary' as keyof UserPreferences,
                                            label: 'Weekly Summary',
                                            description: 'Receive a weekly summary of your pipeline'
                                        },
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{item.label}</p>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4"
                                                checked={preferences[item.key]}
                                                onChange={(e) => setPreferences({
                                                    ...preferences,
                                                    [item.key]: e.target.checked
                                                })}
                                            />
                                        </div>
                                    ))}

                                    <Button onClick={savePreferences} disabled={preferencesSaving} className="gap-2">
                                        <Save className="h-4 w-4" />
                                        {preferencesSaving ? 'Saving...' : 'Save Preferences'}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Integrations Settings */}
                <TabsContent value="integrations" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Integrations</CardTitle>
                            <CardDescription>
                                Connect external tools and services
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                {[
                                    { name: 'Slack', description: 'Get notifications in Slack', connected: false },
                                    { name: 'Gmail', description: 'Sync emails with leads', connected: false },
                                    { name: 'Zapier', description: 'Automate workflows', connected: false },
                                    { name: 'API Access', description: 'Generate API keys for custom integrations', connected: false },
                                ].map((integration, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Plug className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{integration.name}</p>
                                                <p className="text-sm text-muted-foreground">{integration.description}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" disabled>
                                            Connect
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                OAuth integrations coming soon
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>
                                Customize how the app looks and feels
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Theme</Label>
                                <div className="flex items-center gap-2">
                                    <ModeToggle />
                                    <span className="text-sm text-muted-foreground">
                                        Choose your preferred theme
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="language">Language</Label>
                                <select
                                    id="language"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    disabled
                                >
                                    <option>English</option>
                                </select>
                                <p className="text-xs text-muted-foreground">
                                    More languages coming soon
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Account Settings */}
                <TabsContent value="account" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>
                                View your account details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">
                                    You are currently using the free plan. Subscription management coming soon.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <InviteMemberDialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
                onInvite={inviteTeamMember}
            />

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={() => memberToDelete && removeTeamMember(memberToDelete)}
                title="Remove Team Member"
                description="Are you sure you want to remove this team member? This action cannot be undone."
                isLoading={deletingMember}
            />
        </div>
    );
}
