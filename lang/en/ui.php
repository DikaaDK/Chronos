<?php

return [
    'app' => [
        'name' => 'Chronos',
        'version' => 'Chronos v1.0',
    ],
    'navigation' => [
        'section_title' => 'Main navigation',
        'home' => 'Home',
        'journal' => 'Journal',
        'group' => 'Group',
        'profile' => 'Profile',
        'cta' => 'Write new journal',
    ],
    'bottom_bar' => [
        'home' => 'Home',
        'journal' => 'Journal',
        'group' => 'Group',
        'profile' => 'Profile',
        'add' => 'Add journal',
    ],
    'home' => [
        'hero' => [
            'welcome_user' => 'Welcome back, :name 👋',
            'welcome_generic' => 'Welcome',
            'subtitle' => 'Capture your daily stories with ease',
        ],
        'actions' => [
            'add' => 'Add',
            'journal' => 'Journal',
            'calendar' => 'Calendar',
        ],
        'sections' => [
            'latest' => [
                'title' => 'Latest Journals',
                'view_all' => 'View all',
                'empty' => [
                    'title' => 'No journals saved yet.',
                    'description' => 'Start writing your first story!',
                ],
            ],
        ],
        'accessibility' => [
            'view_journal' => 'View journal details :title',
        ],
        'edit_modal' => [
            'title' => 'Edit Journal',
            'submit' => 'Update',
        ],
        'delete_modal' => [
            'title' => 'Delete journal?',
            'description_with_title' => 'Journal ":title" will be deleted permanently.',
            'description' => 'This journal will be deleted permanently.',
            'confirm' => 'Delete',
            'cancel' => 'Cancel',
            'error_generic' => 'Unable to delete the journal.',
            'error_network' => 'Network error occurred. Please try again.',
        ],
        'errors' => [
            'session_expired' => 'Session expired, please log in again.',
            'load_failed' => 'Failed to load journals (:status)',
            'generic_load' => 'Unable to load journals.',
        ],
        'defaults' => [
            'untitled_journal' => 'Untitled journal',
        ],
    ],
    'journal' => [
        'header' => [
            'badge' => 'Private archive',
            'title' => 'Daily Journals',
            'description' => 'Browse entries you have written, edit them as needed, and keep track of your daily progress.',
        ],
        'stats' => [
            'total_label' => 'Total journals',
        ],
        'actions' => [
            'write' => 'Write Journal',
        ],
        'sidebar' => [
            'last_written_label' => 'Last written',
            'last_written_empty' => 'No journal yet',
            'tips_title' => 'Quick tips',
            'tips_description' => 'Use the detail modal to edit or delete a journal without leaving this page.',
        ],
        'empty_state' => [
            'title' => 'No journals saved yet.',
            'description' => 'Start your first story by pressing the "Write Journal" button.',
            'cta' => 'Write Journal',
        ],
        'accessibility' => [
            'view_journal' => 'View journal details :title',
        ],
        'card' => [
            'overdue_badge' => 'Past due',
        ],
        'progress' => [
            'completed' => 'Completed',
            'not_started' => 'Not started',
            'in_progress' => 'In progress',
        ],
        'create_modal' => [
            'title' => 'Add Journal',
            'submit' => 'Save',
        ],
        'edit_modal' => [
            'title' => 'Edit Journal',
            'submit' => 'Update',
        ],
        'delete_modal' => [
            'title' => 'Delete journal?',
            'description_with_title' => 'Journal ":title" will be deleted permanently.',
            'description' => 'This journal will be deleted permanently.',
            'confirm' => 'Delete',
            'cancel' => 'Cancel',
            'error_generic' => 'Unable to delete the journal.',
            'error_network' => 'Network error occurred. Please try again.',
        ],
        'errors' => [
            'load_failed' => 'Failed to load data (:status)',
            'generic_load' => 'Unable to load journals.',
            'user_fetch_failed' => 'Failed to fetch user',
            'save_failed' => 'Failed to save journal.',
        ],
    ],
    'group' => [
        'header' => [
            'badge' => 'Collaboration',
            'title' => 'Manage Groups',
            'description' => 'Build productive teams to write journals together. Create a new group or enter an invite code to join.',
        ],
        'stats' => [
            'total_label' => 'Active groups',
            'total_helper' => 'Includes groups you own or join.',
        ],
        'forms' => [
            'create' => [
                'title' => 'Create New Group',
                'description' => 'Arrange a writing community with your friends.',
                'name_label' => 'Group Name',
                'name_placeholder' => 'Example: Productive Squad',
                'description_label' => 'Description',
                'description_placeholder' => 'Share the group goal or short rules.',
                'submit' => 'Create Group',
            ],
            'join' => [
                'title' => 'Join with Code',
                'description' => 'Enter the invite code you received.',
                'invite_label' => 'Invite Code',
                'invite_placeholder' => 'Enter code',
                'submit' => 'Join',
            ],
        ],
        'list' => [
            'title' => 'Your Groups',
            'count_label' => ':count active groups',
            'empty' => 'You have no groups yet. Create a new one or join with an invite code.',
        ],
        'card' => [
            'no_description' => 'No description yet.',
            'view_detail' => 'View group details',
        ],
    ],
    'group_detail' => [
        'status' => [
            'none' => '-',
            'done' => 'Completed',
            'progress' => 'In progress',
            'pending' => 'Pending',
            'unselected' => 'Not selected',
        ],
    ],
    'auth' => [
        'login' => [
            'sidebar' => [
                'brand_title' => 'Chronos Travel',
                'brand_since' => 'Since 2022',
                'hero_title' => 'A focused blue workspace for your travel rhythm.',
                'hero_subtitle' => 'Manage itineraries, mood tracking, and destination highlights from one responsive dashboard.',
                'writers' => '2.3k travel writers active',
            ],
            'highlights' => [
                'itinerary' => 'Adaptive itinerary templates for city breaks, road trips, or slow travel.',
                'destinations' => 'Save destination highlights and tag the mood of every stop.',
                'mood' => 'Daily mood journaling with automatically organized travel insights.',
            ],
            'badge' => [
                'left' => 'Chronos Login',
                'right' => 'Secured · 24/7',
            ],
            'hero' => [
                'pretitle' => 'Welcome back',
                'title' => 'Sign in to keep writing your travel stories.',
                'description' => 'Track itineraries, mood notes, and destination insights from the Chronos dashboard.',
            ],
            'form' => [
                'email_label' => 'Email',
                'email_placeholder' => 'Chronos@gmail.com',
                'password_label' => 'Password',
                'password_placeholder' => '••••••••',
                'remember' => 'Remember me',
                'forgot' => 'Forgot password?',
                'submit' => 'Sign in now',
                'processing' => 'Processing...',
                'social_divider' => 'or continue with',
                'social_facebook' => 'Facebook',
                'social_github' => 'GitHub',
            ],
            'toggle_password' => [
                'show' => 'Show password',
                'hide' => 'Hide password',
            ],
            'errors' => [
                'validation' => 'Please complete every field correctly.',
                'credentials' => 'Email or password is incorrect.',
                'server' => 'A server error occurred.',
            ],
            'footer' => [
                'question' => 'Need an account?',
                'cta' => 'Sign up for free',
            ],
        ],
    ],
    'profile' => [
        'default_name' => 'Chronos Explorer',
        'default_email' => 'email@chronos.app',
        'email_label' => 'Email',
        'status_label' => 'Status',
        'status_active' => 'Account active',
        'card_cta' => 'Settings',
        'sidebar_subtitle' => 'Manage your profile preferences',
        'cards' => [
            'account' => [
                'title' => 'Account Settings',
                'description' => 'Manage login preferences and security.',
            ],
            'personal' => [
                'title' => 'Personal Information',
                'description' => 'Update your full name and details.',
            ],
            'language' => [
                'title' => 'Change Language',
                'description' => 'Match Chronos to the language you use.',
            ],
            'appearance' => [
                'title' => 'Display Preferences',
                'description' => 'Switch themes and favorite view modes.',
            ],
        ],
        'language_preference' => [
            'title' => 'Language preference',
            'description' => 'Choose the language used across the application.',
            'select_label' => 'Application language',
            'save' => 'Save language',
            'success' => 'Application language updated to :language.',
            'error' => 'Unable to update language, please try again.',
            'options' => [
                'id' => 'Bahasa Indonesia',
                'en' => 'English',
                'zh' => 'Mandarin Chinese',
            ],
        ],
        'logout' => [
            'button' => 'Logout',
            'processing' => 'Logging out...',
        ],
    ],
    'modals' => [
        'logout' => [
            'title' => 'Logout confirmation',
            'description' => 'Are you sure you want to logout from Chronos?',
            'confirm' => 'Logout',
            'cancel' => 'Cancel',
        ],
    ],
    'common' => [
        'processing' => 'Processing...',
    ],
];
