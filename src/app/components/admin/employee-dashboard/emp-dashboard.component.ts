import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';

interface ChartDataPoint {
  x: number;
  y: number;
  label?: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    fill: boolean;
  }[];
}

@Component({
  selector: 'app-emp-dashboard',
  templateUrl: './emp-dashboard.component.html',
  styleUrls: ['./emp-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, ChartModule]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('lineChartCanvas', { static: false }) lineChartCanvas!: ElementRef<HTMLCanvasElement>;

  // Dashboard Statistics
  totalTasks: number = 247;
  completedTasks: number = 156;
  inProgressTasks: number = 64;
  pendingTasks: number = 27;

  // Growth percentages
  totalTasksGrowth: number = 12.5;
  completedTasksGrowth: number = 18.2;
  inProgressTasksGrowth: number = 8.7;
  pendingTasksGrowth: number = -5.3;

  // Chart properties
  chartData: ChartData = {
    labels: [],
    datasets: [{
      label: 'Task Completion',
      data: [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  chartOptions = {
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#e2e8f0'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  selectedTimeFilter: string = '30d';
  private chartContext: CanvasRenderingContext2D | null = null;
  private animationId: number | null = null;

  // Sample data for different time periods
  private chartDataSets = {
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [12, 19, 8, 15, 22, 18, 25]
    },
    '30d': {
      labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
      data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 10)
    },
    '90d': {
      labels: Array.from({ length: 90 }, (_, i) => `Day ${i + 1}`),
      data: Array.from({ length: 90 }, () => Math.floor(Math.random() * 80) + 5)
    }
  };

  constructor() {}

  ngOnInit(): void {
    this.loadChartData();
    this.updateGrowthStyles();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeChart();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  // Task Management
  addNewTask(): void {
    console.log('Adding new task...');
    // Simulate adding a new task
    this.totalTasks++;
    this.pendingTasks++;
    this.updateChartData();
  }

  // Time Filter Management
  setTimeFilter(filter: string): void {
    this.selectedTimeFilter = filter;
    this.loadChartData();
    setTimeout(() => {
      this.initializeChart();
    }, 100);
  }

  // Chart Data Management
  private loadChartData(): void {
    const selectedData = this.chartDataSets[this.selectedTimeFilter as keyof typeof this.chartDataSets];
    
    this.chartData = {
      labels: selectedData.labels,
      datasets: [{
        label: 'Task Completion',
        data: selectedData.data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };

    // Update chart options based on time filter
    this.chartOptions = {
      ...this.chartOptions,
      plugins: {
        ...this.chartOptions.plugins,
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#333',
          bodyColor: '#666',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 10,
          displayColors: false
        }
      }
    };
  }

  private initializeChart(): void {
    if (!this.lineChartCanvas || !this.chartData) {
      return;
    }

    const canvas = this.lineChartCanvas.nativeElement;
    this.chartContext = canvas.getContext('2d');
    
    if (!this.chartContext) {
      return;
    }

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    this.chartContext.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    this.drawChart();
  }

  private drawChart(): void {
    if (!this.chartContext || !this.chartData) {
      return;
    }

    const ctx = this.chartContext;
    const canvas = ctx.canvas;
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    const data = this.chartData.datasets[0].data;
    const labels = this.chartData.labels;
    
    // Chart dimensions
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Find min and max values
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const valueRange = maxValue - minValue || 1;
    
    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }
    
    // Vertical grid lines (for smaller datasets)
    if (data.length <= 10) {
      for (let i = 0; i < data.length; i++) {
        const x = padding + (chartWidth / (data.length - 1)) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, padding + chartHeight);
        ctx.stroke();
      }
    }
    
    // Draw axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.stroke();
    
    // Draw data line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((value, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = '#3b82f6';
    data.forEach((value, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw labels for smaller datasets
    if (data.length <= 10) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
      ctx.textAlign = 'center';
      
      labels.forEach((label, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        ctx.fillText(label, x, height - 20);
      });
    }
    
    // Draw y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (valueRange / 5) * (5 - i);
      const y = padding + (chartHeight / 5) * i;
      ctx.fillText(Math.round(value).toString(), padding - 10, y + 4);
    }
  }

  // Chart Event Handlers
  onChartClick(event: MouseEvent): void {
    console.log('Chart clicked at:', event.offsetX, event.offsetY);
    // Handle chart click events
  }

  onChartHover(event: MouseEvent): void {
    // Handle chart hover events for tooltips
    if (this.lineChartCanvas) {
      const canvas = this.lineChartCanvas.nativeElement;
      canvas.style.cursor = 'crosshair';
    }
  }

  // Chart Analytics Methods
  getHighestValue(): number {
    if (!this.chartData) return 0;
    return Math.max(...this.chartData.datasets[0].data);
  }

  getLowestValue(): number {
    if (!this.chartData) return 0;
    return Math.min(...this.chartData.datasets[0].data);
  }

  getAverageValue(): number {
    if (!this.chartData) return 0;
    const data = this.chartData.datasets[0].data;
    const sum = data.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / data.length);
  }

  getTotalDataPoints(): number {
    if (!this.chartData) return 0;
    return this.chartData.datasets[0].data.length;
  }

  getDataRange(): string {
    if (!this.chartData) return '0-0';
    const min = this.getLowestValue();
    const max = this.getHighestValue();
    return `${min}-${max}`;
  }

  getTrendDirection(): string {
    if (!this.chartData) return 'Stable';
    
    const data = this.chartData.datasets[0].data;
    if (data.length < 2) return 'Stable';
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((acc, val) => acc + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((acc, val) => acc + val, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg * 1.1) return 'Upward';
    if (secondAvg < firstAvg * 0.9) return 'Downward';
    return 'Stable';
  }

  getTrendClass(): string {
    const trend = this.getTrendDirection();
    switch (trend) {
      case 'Upward': return 'positive';
      case 'Downward': return 'negative';
      default: return '';
    }
  }

  getPositiveChanges(): number {
    if (!this.chartData) return 0;
    
    const data = this.chartData.datasets[0].data;
    let positiveChanges = 0;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i] > data[i - 1]) {
        positiveChanges++;
      }
    }
    
    return positiveChanges;
  }

  getNegativeChanges(): number {
    if (!this.chartData) return 0;
    
    const data = this.chartData.datasets[0].data;
    let negativeChanges = 0;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i] < data[i - 1]) {
        negativeChanges++;
      }
    }
    
    return negativeChanges;
  }

  // Utility Methods
  private updateChartData(): void {
    // Simulate real-time data updates
    if (this.chartData && this.chartData.datasets[0].data.length > 0) {
      const currentData = this.chartData.datasets[0].data;
      const lastValue = currentData[currentData.length - 1];
      const newValue = Math.max(0, lastValue + (Math.random() - 0.5) * 10);
      
      // Add new data point
      currentData.push(Math.round(newValue));
      this.chartData.labels.push(`Point ${currentData.length}`);
      
      // Limit data points to prevent overflow
      if (currentData.length > 50) {
        currentData.shift();
        this.chartData.labels.shift();
      }
      
      // Redraw chart
      setTimeout(() => {
        this.drawChart();
      }, 100);
    }
  }

  private updateGrowthStyles(): void {
    // Update growth indicator styles based on values
    const growthElements = document.querySelectorAll('.stat-growth');
    const growthValues = [
      this.totalTasksGrowth,
      this.completedTasksGrowth,
      this.inProgressTasksGrowth,
      this.pendingTasksGrowth
    ];
    
    growthElements.forEach((element, index) => {
      const value = growthValues[index];
      element.classList.remove('positive', 'negative');
      
      if (value > 0) {
        element.classList.add('positive');
        element.querySelector('i')?.classList.remove('pi-arrow-down');
        element.querySelector('i')?.classList.add('pi-arrow-up');
      } else {
        element.classList.add('negative');
        element.querySelector('i')?.classList.remove('pi-arrow-up');
        element.querySelector('i')?.classList.add('pi-arrow-down');
      }
    });
  }

  // Public methods for external API calls (if needed)
  refreshDashboardData(): void {
    // Simulate API call to refresh dashboard data
    console.log('Refreshing dashboard data...');
    
    // Update statistics with new random values
    this.totalTasks = Math.floor(Math.random() * 100) + 200;
    this.completedTasks = Math.floor(this.totalTasks * 0.6);
    this.inProgressTasks = Math.floor(this.totalTasks * 0.25);
    this.pendingTasks = this.totalTasks - this.completedTasks - this.inProgressTasks;
    
    // Update growth percentages
    this.totalTasksGrowth = (Math.random() - 0.5) * 30;
    this.completedTasksGrowth = (Math.random() - 0.3) * 25;
    this.inProgressTasksGrowth = (Math.random() - 0.4) * 20;
    this.pendingTasksGrowth = (Math.random() - 0.6) * 15;
    
    // Reload chart data
    this.loadChartData();
    this.updateGrowthStyles();
    
    setTimeout(() => {
      this.initializeChart();
    }, 100);
  }

  exportChartData(): void {
    if (!this.chartData) return;
    
    const data = {
      labels: this.chartData.labels,
      values: this.chartData.datasets[0].data,
      statistics: {
        highest: this.getHighestValue(),
        lowest: this.getLowestValue(),
        average: this.getAverageValue(),
        trend: this.getTrendDirection()
      }
    };
    
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}