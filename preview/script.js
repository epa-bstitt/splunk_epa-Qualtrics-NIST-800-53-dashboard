// NIST 800-53 Compliance Dashboard Preview Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initStatusChart();
    initRiskChart();
    initFamilyChart();
    initTrendChart();
    
    // Add event listeners for filters
    document.getElementById('time-range').addEventListener('change', updateDashboard);
    document.getElementById('control-family').addEventListener('change', updateDashboard);
    document.getElementById('selected-control-family').addEventListener('change', updateControlDetails);
});

// Initialize Compliance Status Chart
function initStatusChart() {
    const ctx = document.getElementById('statusChart').getContext('2d');
    const statusChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Compliant', 'Partial', 'Non-Compliant'],
            datasets: [{
                data: [21, 5, 4],
                backgroundColor: [
                    '#65a637',
                    '#f8be34',
                    '#d93f3c'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Initialize Risk Distribution Chart
function initRiskChart() {
    const ctx = document.getElementById('riskChart').getContext('2d');
    const riskChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['High Risk', 'Medium Risk', 'Low Risk'],
            datasets: [{
                data: [6, 2, 1],
                backgroundColor: [
                    '#d93f3c',
                    '#f8be34',
                    '#65a637'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Initialize Family Compliance Chart
function initFamilyChart() {
    const ctx = document.getElementById('familyChart').getContext('2d');
    const familyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['AC', 'AU', 'CM', 'IA', 'RA', 'SC', 'SI'],
            datasets: [
                {
                    label: 'Compliant',
                    data: [3, 2, 2, 2, 2, 2, 1],
                    backgroundColor: '#65a637',
                    stack: 'Stack 0'
                },
                {
                    label: 'Partial',
                    data: [1, 1, 1, 1, 1, 1, 1],
                    backgroundColor: '#f8be34',
                    stack: 'Stack 0'
                },
                {
                    label: 'Non-Compliant',
                    data: [1, 0, 1, 0, 1, 1, 1],
                    backgroundColor: '#d93f3c',
                    stack: 'Stack 0'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Initialize Compliance Trend Chart
function initTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    // Generate dates for the last 30 days
    const dates = [];
    for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    
    // Generate compliance trend data with an upward trend
    const trendData = [];
    for (let i = 0; i <= 30; i++) {
        // Start at 65% and end at 90% compliance
        trendData.push(65 + (i * 25 / 30));
    }
    
    const trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Compliance Rate',
                data: trendData,
                borderColor: '#337ab7',
                backgroundColor: 'rgba(51, 122, 183, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 60,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Compliance %'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update dashboard based on filters
function updateDashboard() {
    const timeRange = document.getElementById('time-range').value;
    const controlFamily = document.getElementById('control-family').value;
    
    // In a real implementation, this would fetch new data based on filters
    // For this preview, we'll just show an alert
    alert(`Dashboard updated with filters: Time Range = ${timeRange}, Control Family = ${controlFamily}`);
}

// Update control details based on selected family
function updateControlDetails() {
    const selectedFamily = document.getElementById('selected-control-family').value;
    
    // In a real implementation, this would filter the table
    // For this preview, we'll just show an alert
    alert(`Control details filtered by family: ${selectedFamily}`);
}
