/*const c1 = document.getElementById('statsPieChart');
    new Chart(c1, {
      type: 'pie',
      data: {
        labels: ['Property', 'Gold','Silver','Utilities','Cash'],
        datasets: [{
          data: [5.6, 5.6,11.1,22.2,55.6],
          backgroundColor: ['rgb(122, 122, 218)','rgb(191, 191, 240)','rgb(138, 138, 202)', 'rgb(91, 91, 146)','rgb(78, 78, 152)'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#ccc' }
          }
        }
      },
      tooltip: {
            callbacks: {
              label: function (context) {
                return context.label + ': ' + context.raw + '%';
              }
            }
          }
    });

    const c2=document.getElementById('amtSemiDonutChart').getContext('2d');

    new Chart(c2, {
      type: 'doughnut',
      data: {
        labels: ['Settled amounts', 'Outstanding amounts'],
        datasets: [{
          data: [65, 35], // <-- your actual data here
          backgroundColor: ['#f6a94d', '#fbe36c'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#ccc'
            }
          }
        },
        rotation: -90,    // start angle
        circumference: 180, // semi-circle
        cutout: '60%'    // thickness of the doughnut
      }
    });


    const c3 = document.getElementById('borrowDonutChart').getContext('2d');

    new Chart(c3, {
      type: 'doughnut',
      data: {
        labels: ['Cash', 'Utilities', 'Silver'],
        datasets: [{
          data: [62.5, 25, 12.5],
          backgroundColor: ['#7ED957', '#00C49F', '#004d26'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position:'bottom',
            labels: {
              color: '#ccc'
            }
          },
          
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.label + ': ' + context.raw + '%';
              }
            }
          }
        },
        cutout: '50%'
      }
    });

    */

// Get canvas elements
// ======================== ALL-TIME CHARTS ======================== //

// Get canvas elements safely
const c1 = document.getElementById('statsPieChart')?.getContext('2d');
const c2 = document.getElementById('amtSemiDonutChart')?.getContext('2d');
const c3 = document.getElementById('borrowDonutChart')?.getContext('2d');

if (c1 && c2 && c3) {
  // --- Fetch all data (active + completed) ---
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const history = JSON.parse(localStorage.getItem("history")) || [];

  // Merge both to represent *all time*
  const allData = [...transactions, ...history];

  // --- Helper functions ---
  function getTypeDistribution(typeFilter) {
    const dist = {};
    allData.filter(tx => tx.type === typeFilter).forEach(tx => {
      const amt = parseFloat(tx.amount);
      dist[tx.assetType] = (dist[tx.assetType] || 0) + amt;
    });
    return dist;
  }

  function getTotalAmount(typeFilter) {
    return allData
      .filter(tx => tx.type === typeFilter)
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
  }

  // --- Lent Asset Distribution (Pie) ---
  const lentDist = getTypeDistribution('lent');
  const statsPieChart = new Chart(c1, {
    type: 'pie',
    data: {
      labels: Object.keys(lentDist),
      datasets: [{
        data: Object.values(lentDist),
        backgroundColor: Object.keys(lentDist).map(() => `hsl(${Math.random()*360},60%,60%)`),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#ccc' } },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ₹' + context.raw;
            }
          }
        }
      }
    }
  });

  // --- Semi-Donut Chart (Total Lent vs Total Borrowed) ---
  const totalLent = getTotalAmount('lent');
  const totalBorrowed = getTotalAmount('borrowed');
  const amtSemiDonutChart = new Chart(c2, {
    type: 'doughnut',
    data: {
      labels: ['Total Lent', 'Total Borrowed'],
      datasets: [{
        data: [totalLent, totalBorrowed],
        backgroundColor: ['#f6a94d', '#fbe36c'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      rotation: -90,
      circumference: 180,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#ccc' } },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ₹' + context.raw;
            }
          }
        }
      }
    }
  });

  // --- Borrowed Asset Distribution (Donut) ---
  const borrowedDist = getTypeDistribution('borrowed');
  const borrowDonutChart = new Chart(c3, {
    type: 'doughnut',
    data: {
      labels: Object.keys(borrowedDist),
      datasets: [{
        data: Object.values(borrowedDist),
        backgroundColor: Object.keys(borrowedDist).map(() => `hsl(${Math.random()*360},60%,60%)`),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      cutout: '50%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#ccc' } },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ₹' + context.raw;
            }
          }
        }
      }
    }
  });

  // --- Refresh Charts Dynamically (for live updates) ---
  window.refreshCharts = function() {
    const history = JSON.parse(localStorage.getItem("history")) || [];
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    const allData = [...transactions, ...history];

    // Lent Distribution
    const updatedLentDist = {};
    allData.filter(tx => tx.type === "lent").forEach(tx => {
      updatedLentDist[tx.assetType] = (updatedLentDist[tx.assetType] || 0) + parseFloat(tx.amount);
    });
    statsPieChart.data.labels = Object.keys(updatedLentDist);
    statsPieChart.data.datasets[0].data = Object.values(updatedLentDist);
    statsPieChart.update();

    // Borrowed Distribution
    const updatedBorrowDist = {};
    allData.filter(tx => tx.type === "borrowed").forEach(tx => {
      updatedBorrowDist[tx.assetType] = (updatedBorrowDist[tx.assetType] || 0) + parseFloat(tx.amount);
    });
    borrowDonutChart.data.labels = Object.keys(updatedBorrowDist);
    borrowDonutChart.data.datasets[0].data = Object.values(updatedBorrowDist);
    borrowDonutChart.update();

    // Lent vs Borrowed
    const totalLent = allData.filter(tx => tx.type === "lent").reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const totalBorrowed = allData.filter(tx => tx.type === "borrowed").reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    amtSemiDonutChart.data.datasets[0].data = [totalLent, totalBorrowed];
    amtSemiDonutChart.update();
  };
}
