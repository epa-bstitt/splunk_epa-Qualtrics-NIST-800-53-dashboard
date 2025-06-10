/**
 * NIST 800-53 Compliance Dashboard
 * This JavaScript file provides the functionality for the NIST 800-53 compliance dashboard
 * using Splunk's JavaScript API.
 */

require([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/chartview',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/tokenutils',
    'splunkjs/mvc/simplexml/ready!'
], function($, _, mvc, SearchManager, ChartView, TableView, TokenUtils) {
    'use strict';
    
    // Define color scheme for compliance status
    const COLORS = {
        compliant: '#65a637',
        partial: '#f8be34',
        nonCompliant: '#d93f3c',
        notApplicable: '#999999'
    };
    
    // Define NIST 800-53 control families
    const CONTROL_FAMILIES = {
        'AC': 'Access Control',
        'AT': 'Awareness and Training',
        'AU': 'Audit and Accountability',
        'CA': 'Assessment, Authorization, and Monitoring',
        'CM': 'Configuration Management',
        'CP': 'Contingency Planning',
        'IA': 'Identification and Authentication',
        'IR': 'Incident Response',
        'MA': 'Maintenance',
        'MP': 'Media Protection',
        'PE': 'Physical and Environmental Protection',
        'PL': 'Planning',
        'PM': 'Program Management',
        'PS': 'Personnel Security',
        'RA': 'Risk Assessment',
        'SA': 'System and Services Acquisition',
        'SC': 'System and Communications Protection',
        'SI': 'System and Information Integrity'
    };
    
    // Populate control family dropdown
    function populateControlFamilies() {
        const $dropdown = $('#control-family');
        
        Object.keys(CONTROL_FAMILIES).forEach(function(key) {
            $dropdown.append($('<option>', {
                value: key,
                text: key + ' - ' + CONTROL_FAMILIES[key]
            }));
        });
    }
    
    // Initialize time range and control family filters
    function initializeFilters() {
        populateControlFamilies();
        
        $('#time-range').on('change', function() {
            updateTimeRange($(this).val());
        });
        
        $('#control-family').on('change', function() {
            updateControlFamily($(this).val());
        });
        
        // Set initial values
        updateTimeRange('7d');
        updateControlFamily('all');
    }
    
    // Update search time range
    function updateTimeRange(range) {
        let earliest = '';
        
        switch(range) {
            case '24h':
                earliest = '-24h';
                break;
            case '7d':
                earliest = '-7d';
                break;
            case '30d':
                earliest = '-30d';
                break;
            case '90d':
                earliest = '-90d';
                break;
            default:
                earliest = '-7d';
        }
        
        // Update all search managers with new time range
        Object.values(mvc.Components.getInstances()).forEach(function(component) {
            if (component instanceof SearchManager) {
                component.settings.set('earliest_time', earliest);
                component.startSearch();
            }
        });
    }
    
    // Update control family filter
    function updateControlFamily(family) {
        let filter = '';
        
        if (family !== 'all') {
            filter = 'control_family=' + family;
        }
        
        // Update all search managers with new filter
        Object.values(mvc.Components.getInstances()).forEach(function(component) {
            if (component instanceof SearchManager) {
                let search = component.settings.get('search');
                
                // Only modify searches that include control_family
                if (search && search.includes('control_family')) {
                    // Remove existing control_family filter if any
                    search = search.replace(/\s*control_family=[^\s|]+\s*/, ' ');
                    
                    // Add new filter if not "all"
                    if (family !== 'all') {
                        // Find where to insert the filter
                        const insertPoint = search.indexOf('|') !== -1 ? 
                            search.indexOf('|', search.indexOf('|') + 1) : 
                            search.length;
                        
                        search = search.substring(0, insertPoint) + 
                                ' ' + filter + ' ' + 
                                search.substring(insertPoint);
                    }
                    
                    component.settings.set('search', search);
                    component.startSearch();
                }
            }
        });
    }
    
    // Create search managers for each visualization
    
    // 1. Overall Compliance Score
    const overallComplianceSearch = new SearchManager({
        id: 'overall-compliance-search',
        search: '| inputlookup nist_control_status.csv | stats count(eval(compliance_status="compliant")) as compliant, count(eval(compliance_status="non-compliant")) as non_compliant, count(eval(compliance_status="partial")) as partial, count(eval(compliance_status="not_applicable")) as not_applicable | eval total=compliant+non_compliant+partial | eval compliance_score=round(compliant/total*100, 2)',
        earliest_time: '-7d',
        latest_time: 'now',
        preview: true,
        cache: false
    });
    
    // 2. Compliance Status Distribution
    const complianceStatusSearch = new SearchManager({
        id: 'compliance-status-search',
        search: '| inputlookup nist_control_status.csv | stats count by compliance_status | eval percent=round(count/sum(count)*100, 2)',
        earliest_time: '-7d',
        latest_time: 'now',
        preview: true,
        cache: false
    });
    
    // 3. Risk Distribution
    const riskDistributionSearch = new SearchManager({
        id: 'risk-distribution-search',
        search: '| inputlookup nist_control_status.csv | search compliance_status="non-compliant" OR compliance_status="partial" | stats count by risk_level | eval percent=round(count/sum(count)*100, 2)',
        earliest_time: '-7d',
        latest_time: 'now',
        preview: true,
        cache: false
    });
    
    // 4. Compliance by Control Family
    const familyComplianceSearch = new SearchManager({
        id: 'family-compliance-search',
        search: '| inputlookup nist_control_status.csv | stats count(eval(compliance_status="compliant")) as compliant, count(eval(compliance_status="non-compliant")) as non_compliant, count(eval(compliance_status="partial")) as partial by control_family | eval compliance_rate=round(compliant/(compliant+non_compliant+partial)*100, 2)',
        earliest_time: '-7d',
        latest_time: 'now',
        preview: true,
        cache: false
    });
    
    // 5. Compliance Trend
    const complianceTrendSearch = new SearchManager({
        id: 'compliance-trend-search',
        search: '| inputlookup nist_control_history.csv | timechart span=1d avg(compliance_rate) as "Compliance Rate"',
        earliest_time: '-30d',
        latest_time: 'now',
        preview: true,
        cache: false
    });
    
    // 6. Top Non-Compliant Controls
    const nonCompliantSearch = new SearchManager({
        id: 'non-compliant-search',
        search: '| inputlookup nist_control_status.csv | search compliance_status="non-compliant" OR compliance_status="partial" | sort - risk_level | head 10',
        earliest_time: '-7d',
        latest_time: 'now',
        preview: true,
        cache: false
    });
    
    // 7. Control Details
    const controlDetailsSearch = new SearchManager({
        id: 'control-details-search',
        search: '| inputlookup nist_control_details.csv | search control_family=$selected_control_family$ | sort control_id',
        earliest_time: '-7d',
        latest_time: 'now',
        preview: true,
        cache: false
    });
    
    // Create and configure visualizations
    
    // 1. Overall Compliance Score
    overallComplianceSearch.on('search:done', function() {
        const results = overallComplianceSearch.data('results');
        if (results && results.data().length > 0) {
            const data = results.data()[0];
            const score = data.compliance_score || 0;
            
            // Determine color based on score
            let color = COLORS.nonCompliant;
            if (score >= 80) {
                color = COLORS.compliant;
            } else if (score >= 60) {
                color = COLORS.partial;
            }
            
            // Update the compliance score display
            $('#compliance-score').html(`
                <div class="score-value" style="color: ${color};">${score}%</div>
                <div class="score-label">Overall Compliance</div>
                <div class="score-details">
                    <span class="detail-item"><span class="dot" style="background-color: ${COLORS.compliant};"></span> Compliant: ${data.compliant || 0}</span>
                    <span class="detail-item"><span class="dot" style="background-color: ${COLORS.partial};"></span> Partial: ${data.partial || 0}</span>
                    <span class="detail-item"><span class="dot" style="background-color: ${COLORS.nonCompliant};"></span> Non-Compliant: ${data.non_compliant || 0}</span>
                </div>
            `);
        }
    });
    
    // 2. Compliance Status Chart
    const complianceStatusChart = new ChartView({
        id: 'compliance-status-chart',
        managerid: 'compliance-status-search',
        type: 'pie',
        el: $('#compliance-status-chart'),
        height: '300px',
        chartOptions: {
            colors: [COLORS.compliant, COLORS.partial, COLORS.nonCompliant, COLORS.notApplicable]
        }
    }).render();
    
    // 3. Risk Distribution Chart
    const riskDistributionChart = new ChartView({
        id: 'risk-distribution-chart',
        managerid: 'risk-distribution-search',
        type: 'pie',
        el: $('#risk-distribution-chart'),
        height: '300px'
    }).render();
    
    // 4. Family Compliance Chart
    const familyComplianceChart = new ChartView({
        id: 'family-compliance-chart',
        managerid: 'family-compliance-search',
        type: 'bar',
        el: $('#family-compliance-chart'),
        height: '400px',
        options: {
            chart: {
                stack: 'default'
            },
            seriesColors: [COLORS.compliant, COLORS.nonCompliant, COLORS.partial]
        }
    }).render();
    
    // 5. Compliance Trend Chart
    const complianceTrendChart = new ChartView({
        id: 'compliance-trend-chart',
        managerid: 'compliance-trend-search',
        type: 'line',
        el: $('#compliance-trend-chart'),
        height: '300px'
    }).render();
    
    // 6. Non-Compliant Controls Table
    const nonCompliantTable = new TableView({
        id: 'non-compliant-table',
        managerid: 'non-compliant-search',
        el: $('#non-compliant-table'),
        pageSize: 10,
        drilldown: 'row',
        drilldownRedirect: false
    }).render();
    
    // 7. Control Details Table
    const controlDetailsTable = new TableView({
        id: 'control-details-table',
        managerid: 'control-details-search',
        el: $('#control-details-table'),
        pageSize: 20,
        drilldown: 'row',
        drilldownRedirect: false
    }).render();
    
    // Handle drilldown events
    nonCompliantTable.on('click', function(e) {
        if (e.field !== undefined) {
            const controlId = e.data['row.control_id'];
            TokenUtils.setToken('selected_control', controlId);
            
            // Create a drill-down search for the selected control
            const drilldownSearch = new SearchManager({
                id: 'drilldown-search',
                search: '| inputlookup nist_control_events.csv | search control_id="' + controlId + '" | sort - _time | head 100',
                earliest_time: '-7d',
                latest_time: 'now',
                preview: true
            });
            
            // Create a modal for the drilldown content
            const modal = $('<div class="modal fade" tabindex="-1" role="dialog"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">Control Details: ' + controlId + '</h4><button type="button" class="close" data-dismiss="modal">&times;</button></div><div class="modal-body"><div id="drilldown-table"></div></div></div></div></div>');
            $('body').append(modal);
            
            // Create the drilldown table
            const drilldownTable = new TableView({
                id: 'drilldown_table',
                managerid: 'drilldown-search',
                el: $('#drilldown-table'),
                pageSize: 10
            }).render();
            
            modal.modal('show');
            modal.on('hidden.bs.modal', function() {
                modal.remove();
                drilldownSearch.dispose();
            });
        }
    });
    
    // Add export functionality
    const exportButton = $('<button class="btn btn-primary">Export Report</button>');
    $('.dashboard-header').append(exportButton);
    
    exportButton.on('click', function() {
        const exportSearch = new SearchManager({
            id: 'export-search',
            search: '| inputlookup nist_control_status.csv | stats count by control_id, control_name, compliance_status, last_check_time | outputcsv nist_compliance_report.csv',
            earliest_time: '-7d',
            latest_time: 'now',
            preview: true
        });
        
        exportSearch.on('search:done', function() {
            window.open(Splunk.util.make_url('/api/search/jobs/' + exportSearch.job.getSearchId() + '/results?output_mode=csv'), '_blank');
        });
    });
    
    // Add refresh functionality
    const refreshButton = $('<button class="btn btn-default">Refresh Data</button>');
    $('.dashboard-header').append(refreshButton);
    
    refreshButton.on('click', function() {
        // Refresh all searches
        Object.values(mvc.Components.getInstances()).forEach(function(component) {
            if (component instanceof SearchManager) {
                component.startSearch();
            }
        });
    });
    
    // Initialize the dashboard
    initializeFilters();
});
