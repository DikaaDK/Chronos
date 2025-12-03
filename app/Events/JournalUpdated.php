<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JournalUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public int $userId,
        public string $action,
        public array $journal
    ) {
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("journals.{$this->userId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'JournalUpdated';
    }

    public function broadcastWith(): array
    {
        return [
            'action' => $this->action,
            'journal' => $this->journal,
        ];
    }
}
