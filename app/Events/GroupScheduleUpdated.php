<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupScheduleUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public int $groupId,
        public string $action,
        public ?array $entry
    ) {
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel("groups.{$this->groupId}")];
    }

    public function broadcastAs(): string
    {
        return 'GroupScheduleUpdated';
    }

    public function broadcastWith(): array
    {
        return [
            'action' => $this->action,
            'group_id' => $this->groupId,
            'entry' => $this->entry,
        ];
    }
}
