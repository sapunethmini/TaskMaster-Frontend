import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-employee-progress',
  templateUrl: './employee-progress.component.html',
  styleUrls: ['./employee-progress.component.css'],
  standalone: true,
  imports: [CommonModule, CardModule, ChartModule, ProgressBarModule]
})
export class EmployeeProgressComponent implements OnInit {
  overallProgress = 75;
  monthlyProgress = 80;
  weeklyProgress = 65;

  chartData: any;
  chartOptions: any;

  performanceMetrics = [
    { label: 'Task Completion Rate', value: 85, color: '#3B82F6' },
    { label: 'On-time Delivery', value: 90, color: '#10B981' },
    { label: 'Code Quality', value: 88, color: '#F59E0B' },
    { label: 'Team Collaboration', value: 92, color: '#8B5CF6' }
  ];

  recentAchievements = [
    {
      title: 'Completed 50 Tasks',
      date: '2024-03-20',
      description: 'Reached milestone of completing 50 tasks'
    },
    {
      title: 'Perfect Week',
      date: '2024-03-15',
      description: 'Completed all tasks on time for the week'
    },
    {
      title: 'Team Player Award',
      date: '2024-03-10',
      description: 'Recognized for excellent team collaboration'
    }
  ];

  constructor() { }

  ngOnInit() {
    this.initializeChart();
  }

  initializeChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartData = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Task Completion',
          data: [65, 75, 85, 80],
          backgroundColor: '#3B82F6',
          borderColor: '#3B82F6',
          borderWidth: 1
        },
        {
          label: 'On-time Delivery',
          data: [70, 80, 90, 85],
          backgroundColor: '#10B981',
          borderColor: '#10B981',
          borderWidth: 1
        }
      ]
    };

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }
} 