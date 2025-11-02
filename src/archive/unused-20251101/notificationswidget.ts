import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [CommonModule, AvatarModule],
    template: `
    <div class="card">
        <div class="font-semibold text-xl mb-4">Notifications</div>
        <ul class="list-none p-0 m-0">
            <li class="flex items-start mb-4">
                <p-avatar image="/assets/demo/images/avatar/amyelsner.png" shape="circle" size="large"></p-avatar>
                <div class="ml-3">
                    <div class="text-surface-900 dark:text-surface-0 font-medium">New comment</div>
                    <div class="text-muted-color">You have a new comment on your post.</div>
                </div>
            </li>
            <li class="flex items-start mb-4">
                <p-avatar image="/assets/demo/images/avatar/onyamalimba.png" shape="circle" size="large"></p-avatar>
                <div class="ml-3">
                    <div class="text-surface-900 dark:text-surface-0 font-medium">Update available</div>
                    <div class="text-muted-color">Version 2.0.1 is available.</div>
                </div>
            </li>
        </ul>
    </div>
    `
})
export class NotificationsWidget {}
