import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TaskService } from '../../../services/task.service';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-task-creation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
    ButtonModule
  ],
  templateUrl: './task-creation-form.component.html',
  styleUrls: ['./task-creation-form.component.css']
})
export class TaskCreationFormComponent implements OnInit {
  taskForm!: FormGroup;
  submitted = false;
  minDate: Date = new Date();

  employee: any;
  team: string = '';

  constructor(
    private fb: FormBuilder,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private taskService: TaskService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.employee = this.config.data?.employee;
    this.team = this.config.data?.teamId;

    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      team: [this.team || '', Validators.required],
      dueDate: ['', Validators.required],
      duration: [1, [Validators.required, Validators.min(0.5)]],
      status: ['', Validators.required],
      priority: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.taskForm.invalid) return;

    const payload = {
      ...this.taskForm.value,
      userId: this.config.data?.employee?.id
    };
    console.log('Payload being sent:', payload);

    this.taskService.createTask(payload).subscribe({
      next: () => {
        this.ref.close(true);
      },
      error: (err: HttpErrorResponse) => {
        this.ref.close(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to create task'
        });
      }
    });
  }

  onReset() {
    const teamValue = this.taskForm.get('team')?.value;
    this.taskForm.reset({
      team: teamValue
    });
    this.submitted = false;
  }

  get f() {
    return this.taskForm.controls;
  }

  statusOptions = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' }
  ];
  priorityOptions = [
    { label: 'High', value: 'HIGH' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Low', value: 'LOW' }
  ];

  teamOptions = [
    { label: 'Development Team', value: '001' },
    { label: 'Marketing Team', value: '002' },
    { label: 'Sales Team', value: '003' },
    { label: 'HR Team', value: '004' },
    { label: 'Operation Team', value: '005' },
    { label: 'Design Team', value: '006' },
  ];
}
