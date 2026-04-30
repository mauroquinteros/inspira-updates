# MVP Plan: Scheduled WhatsApp Group Messages

## Objective

Build a small web app that lets me:

- connect one WhatsApp account through Evolution API
- save existing WhatsApp groups that I want to use
- create a text message
- choose a group and a send time
- send the message automatically later
- review what was sent and what failed

## Final Scope for MVP

### In scope
- one WhatsApp instance
- existing groups only
- text messages only
- one-time scheduled messages
- manual reconnect if the WhatsApp session drops
- execution history
- simple saved groups management

### Out of scope
- community announcements
- recurring schedules
- media files
- multiple WhatsApp accounts
- multi-user SaaS
- advanced analytics
- advanced retry logic
- queue infrastructure beyond what is strictly necessary

## Chosen Stack

### App layer
- Next.js app
- frontend and backend in the same project
- PostgreSQL as the database

### Messaging gateway
- Evolution API as the WhatsApp gateway

## Runtime Components

### 1. Next.js app
Responsibilities:
- render UI
- store scheduled messages
- store saved groups
- run scheduling logic
- call Evolution API
- store execution logs

### 2. Evolution API service
Responsibilities:
- manage WhatsApp instance/session
- expose HTTP endpoints for instance lifecycle, groups, and sending messages

### 3. PostgreSQL database
Responsibilities:
- persist scheduled messages
- persist execution logs
- persist saved groups

## WhatsApp Connection Flow

The user will start the WhatsApp connection flow from the Next.js app.

### How it works
1. The user opens the session screen in the Next.js app.
2. The Next.js server calls Evolution API to create or connect an instance.
3. Evolution API returns the QR code data.
4. The Next.js app displays the QR code in the UI.
5. The user scans the QR code using WhatsApp on their phone.
6. Evolution API keeps and manages the WhatsApp session.
7. The Next.js app checks the connection state and shows whether the session is connected.

### Important note
- The connection flow starts from the Next.js app UI.
- The actual WhatsApp session is managed by Evolution API.
- The frontend should never call Evolution API directly.
- All Evolution API calls should go through server-side code in the Next.js app.

## Database Design

### `saved_groups`
Purpose: store the groups I care about, without building a full sync system.

Columns:
- `id` uuid primary key
- `group_jid` text unique not null
- `group_name` text not null
- `is_active` boolean default true
- `created_at` timestamp not null
- `updated_at` timestamp not null

### `scheduled_messages`
Purpose: store messages that should be sent later.

Columns:
- `id` uuid primary key
- `group_id` uuid not null references `saved_groups(id)`
- `content` text not null
- `scheduled_for` timestamp not null
- `status` text not null
- `created_at` timestamp not null
- `updated_at` timestamp not null
- `sent_at` timestamp null

Suggested status values:
- `scheduled`
- `sent`
- `failed`
- `cancelled`

### `message_executions`
Purpose: log every send attempt.

Columns:
- `id` uuid primary key
- `scheduled_message_id` uuid not null references `scheduled_messages(id)`
- `executed_at` timestamp not null
- `status` text not null
- `response_payload` jsonb null
- `error_message` text null

## Main User Flows

### Flow 1: Connect WhatsApp
1. Create one Evolution instance.
2. Connect the instance through QR or pairing flow.
3. Confirm that the instance is connected.
4. Show current session status in the app.

### Flow 2: Save a group
1. User gets the group JID.
2. App optionally validates the group using Evolution API.
3. App stores the group in `saved_groups`.
4. Group becomes selectable when scheduling a message.

### Flow 3: Schedule a message
1. User selects a saved group.
2. User writes a text message.
3. User chooses a date and time.
4. App stores the record in `scheduled_messages` with status `scheduled`.

### Flow 4: Execute scheduled message
1. Scheduler checks for due messages.
2. App calls Evolution API to send the text message.
3. App stores an execution log.
4. App updates message status to `sent` or `failed`.

### Flow 5: Review history
1. User opens the history screen.
2. User sees pending, sent, failed, and cancelled messages.
3. User can inspect failure reason.

## Screens for MVP

### 1. Session screen
- show connection state
- connect instance
- reconnect if needed

### 2. Saved groups screen
- add group manually
- list saved groups
- disable or remove saved groups

### 3. Schedule message screen
- select saved group
- write text message
- choose send date/time
- save schedule

### 4. History screen
- list all scheduled messages
- filter by status
- inspect last execution result

## Scheduling Strategy

Keep it simple.

### First version
- use a periodic server-side job
- every minute, query for messages where:
  - `status = 'scheduled'`
  - `scheduled_for <= now()`
- process them one by one

### Why this is enough
- low volume use case
- one account
- one or a few groups
- maximum 2 messages per day

No Redis or BullMQ in the first version unless implementation pain appears.

## Evolution API Usage in MVP

### Required capabilities
- create/connect one instance
- check instance connection state
- optionally restart the instance if disconnected
- validate group info by JID
- send text message

### How the app should use it
- Next.js server code calls Evolution API directly
- frontend never calls Evolution API directly
- Evolution API credentials stay server-side only

## Validation Rules

### Saved groups
- `group_jid` must not be empty
- `group_name` must not be empty
- prevent duplicates by `group_jid`

### Scheduled messages
- message content required
- scheduled time must be in the future
- group must be active

## Failure Handling

### For MVP
- if sending fails, store a `failed` status
- store error details in `message_executions`
- do not auto-retry in v1
- allow manual retry later through UI if needed

## Technical Decisions

### Keep
- one Next.js project
- PostgreSQL
- one Evolution instance
- simple polling scheduler
- server-side calls to Evolution API

### Avoid for now
- separate backend repo
- Redis
- BullMQ
- webhooks unless clearly needed
- automatic group sync
- support for communities/announcements

## Milestones

### Milestone 1: Connectivity
- run Evolution API
- create instance
- connect WhatsApp
- confirm session state
- manually send one test message

### Milestone 2: Groups and DB
- create PostgreSQL schema
- add `saved_groups`
- add `scheduled_messages`
- add `message_executions`
- build saved groups screen

### Milestone 3: Scheduling
- build schedule form
- save scheduled messages
- implement periodic scheduler
- send messages automatically

### Milestone 4: Observability
- build history screen
- show status and failures
- improve session status visibility

## Open Questions for Next Iteration

- how will I obtain the group JID in the most convenient way?
- should I add manual retry from the history screen?
- do I need timezone support per message or one global timezone is enough?
- do I need recurring messages later?

## Recommended First Build Order

1. Connect WhatsApp through Evolution API
2. Manually send one text message to a known group
3. Create DB schema
4. Add saved groups screen
5. Add schedule form
6. Add minute-based scheduler
7. Add history/log screen
