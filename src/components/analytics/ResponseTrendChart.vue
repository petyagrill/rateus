<template>
  <div class="response-trend-chart">
    <div v-if="!data || data.length === 0" class="chart-empty-state">
      <p class="text-center text-muted">No data available</p>
    </div>
    <div v-else ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

export default {
  name: 'ResponseTrendChart',
  props: {
    data: {
      type: Array,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const chartContainer = ref(null)
    let chart = null

    // Create and render the chart
    const renderChart = () => {
      return;
      if (!chartContainer.value || !props.data || props.data.length === 0) return

      // Destroy existing chart if it exists
      if (chart) {
        chart.destroy()
      }

      // Prepare data for chart
      const labels = props.data.map(item => {
        const date = new Date(item.date)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })

      const responseData = props.data.map(item => item.count)

      // Create new chart
      const ctx = chartContainer.value.getContext('2d')

      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Responses',
              data: responseData,
              borderColor: '#4361ee',
              backgroundColor: 'rgba(67, 97, 238, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#ffffff',
              pointBorderColor: '#4361ee',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: 10,
              cornerRadius: 4,
              caretPadding: 6,
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              },
              displayColors: false,
              callbacks: {
                title: (tooltipItems) => {
                  return tooltipItems[0].label
                },
                label: (tooltipItem) => {
                  return `Responses: ${tooltipItem.raw}`
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#6c757d',
                font: {
                  size: 11
                },
                maxRotation: 0
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                precision: 0,
                color: '#6c757d',
                font: {
                  size: 11
                }
              }
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
          ...props.options
        }
      })
    }

    // Initialize chart on component mount
    onMounted(() => {
      renderChart()
    })

    // Update chart when data changes
    watch(() => props.data, () => {
      renderChart()
    }, { deep: true })

    // Clean up on component unmount
    onUnmounted(() => {
      if (chart) {
        chart.destroy()
      }
    })

    return {
      chartContainer
    }
  }
}
</script>

<style scoped>
.response-trend-chart {
  width: 100%;
  height: 100%;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.chart-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>