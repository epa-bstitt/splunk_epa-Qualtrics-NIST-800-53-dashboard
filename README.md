# Splunk NIST 800-53 Compliance Dashboard for Qualtrics

This Splunk application provides a comprehensive dashboard for monitoring and reporting on NIST 800-53 compliance controls. It helps organizations visualize, track, and report on their compliance with NIST 800-53 security controls.

## Features

- Real-time compliance status monitoring
- Overall compliance score visualization
- Control-specific drill-down capabilities
- Compliance trend analysis over time
- Risk level distribution visualization
- Compliance by control family breakdown
- Top non-compliant controls identification
- Detailed control implementation status tracking
- Customizable filters by time range and control family
- Export functionality for compliance reporting

## Prerequisites

- Splunk Enterprise 8.x or higher
- Admin access to your Splunk instance
- Properly configured data sources with relevant security and compliance logs
- Email server access for alert notifications (if using email alerts)

## Email Configuration

For security, email alerts are restricted to specific domains. To configure email settings:

1. Edit `$SPLUNK_HOME/etc/apps/nist_800_53_dashboard/default/alert_actions.conf`
2. Update the following settings:
   - `allowedDomainList`: Add your organization's email domains (comma-separated)
   - `mailserver`: Your SMTP server address
   - `from`: Sender email address
   - `use_tls`: Set to `true` for secure email transmission

Example configuration:
```
[default]
allowedDomainList = yourdomain.gov, example.com
mailserver = smtp.yourdomain.gov
from = splunk@yourdomain.gov
use_tls = true
```

## Installation Instructions

### Method 1: Direct Installation (Recommended)

1. Clone or download this repository
2. Create a directory named `nist_800_53_dashboard` in `$SPLUNK_HOME/etc/apps/`
3. Copy all files from this repository into the new directory, maintaining the following structure:
   ```
   nist_800_53_dashboard/
   ├── appserver/
   │   └── static/
   │       ├── css/
   │       │   └── nist_dashboard.css
   │       └── js/
   │           └── nist_dashboard.js
   ├── bin/
   ├── default/
   │   ├── app.conf
   │   └── data/
   │       └── ui/
   │           ├── nav/
   │           │   └── default.xml
   │           └── views/
   │               └── nist_dashboard.xml
   ├── lookups/
   │   ├── nist_control_details.csv
   │   ├── nist_control_events.csv
   │   ├── nist_control_history.csv
   │   └── nist_control_status.csv
   └── metadata/
       └── default.meta
   ```
4. Restart Splunk:
   ```
   $SPLUNK_HOME/bin/splunk restart
   ```

### Method 2: Using Splunk Web Interface

1. Create a tarball or ZIP file of the `nist_800_53_dashboard` directory
   ```
   tar -czf nist_800_53_dashboard.tar.gz nist_800_53_dashboard/
   ```
2. Log in to your Splunk Web interface
3. Navigate to "Apps" > "Manage Apps"
4. Click "Install app from file"
5. Upload the tarball or ZIP file
6. Restart Splunk when prompted

### Method 3: Using Splunk CLI

1. Create a tarball of the `nist_800_53_dashboard` directory
   ```
   tar -czf nist_800_53_dashboard.tar.gz nist_800_53_dashboard/
   ```
2. Use the Splunk CLI to install the app:
   ```
   $SPLUNK_HOME/bin/splunk install app nist_800_53_dashboard.tar.gz
   ```
3. Restart Splunk:
   ```
   $SPLUNK_HOME/bin/splunk restart
   ```

## Configuration

### Data Sources Setup

1. After installation, navigate to the NIST 800-53 Dashboard app in Splunk
2. Configure data inputs to collect compliance data:
   - **Option 1**: Use the sample lookup files provided with the app (for testing)
   - **Option 2**: Configure Splunk to ingest your compliance data from:
     - Security scanning tools
     - Compliance assessment reports
     - System logs with compliance-relevant events
     - Configuration management databases
     - Vulnerability scanners

### Index Configuration

1. Create a dedicated index for compliance data (recommended):
   ```
   $SPLUNK_HOME/bin/splunk add index compliance
   ```
2. Update your inputs to send compliance data to this index

### Lookup Files

The app includes sample lookup files that can be replaced with your actual compliance data:

- `nist_control_status.csv`: Current compliance status for each control
- `nist_control_history.csv`: Historical compliance data for trend analysis
- `nist_control_details.csv`: Detailed implementation status of controls
- `nist_control_events.csv`: Specific events related to control compliance

## Usage

### Accessing the Dashboard

1. Log in to Splunk
2. Navigate to the app selector in the top left
3. Select "NIST 800-53 Dashboard"
4. The main dashboard will load automatically

### Using Dashboard Features

1. **Time Range Filter**: Select different time periods to view compliance data
2. **Control Family Filter**: Focus on specific control families
3. **Compliance Score**: View your overall compliance percentage
4. **Status Distribution**: See the breakdown of compliant vs. non-compliant controls
5. **Risk Distribution**: Understand the risk levels of non-compliant controls
6. **Control Family Breakdown**: View compliance by control family
7. **Compliance Trend**: Track how compliance has changed over time
8. **Non-Compliant Controls**: Focus on the most critical non-compliant controls
9. **Control Details**: View detailed information about specific controls

### Drill-Down Capabilities

1. Click on any chart element to drill down into specific controls
2. Use the modal windows to view detailed events related to specific controls
3. Filter the control details table by selecting a specific control family

### Exporting Reports

1. Use the export button to generate PDF reports of the dashboard
2. Schedule regular reports to be sent to stakeholders via email
3. Export raw data for further analysis in other tools

## Next Steps

### Populating with Real Data

1. **Replace Sample Lookup Files**:
   - Update the CSV files in the `lookups/` directory with your actual compliance data
   - Ensure the column names match the expected format

2. **Set Up Automated Data Collection**:
   - Create scripts to automatically update lookup files from your compliance tools
   - Configure scheduled searches to generate compliance metrics
   - Set up alerts for compliance violations

3. **Integrate with Security Tools**:
   - Connect to vulnerability scanners
   - Pull data from configuration management databases
   - Integrate with incident management systems

### Enhancing the Dashboard

1. **Add Custom Visualizations**:
   - Create additional panels for specific compliance requirements
   - Develop custom visualizations for your organization's needs

2. **Implement Role-Based Access**:
   - Configure different views for different user roles
   - Restrict access to sensitive compliance data

3. **Create Scheduled Reports**:
   - Set up automated PDF exports
   - Configure email delivery to stakeholders
   - Create custom report formats

## Customization

### Modifying Dashboard Components

1. **XML View Files**:
   - Edit `default/data/ui/views/nist_dashboard.xml` to change the layout and panels
   - Add or remove visualization panels as needed

2. **JavaScript Functionality**:
   - Modify `appserver/static/js/nist_dashboard.js` to change the dashboard behavior
   - Update search queries to match your data sources
   - Customize chart configurations and drill-down behavior

3. **CSS Styling**:
   - Adjust `appserver/static/css/nist_dashboard.css` to match your organization's branding
   - Modify the appearance of charts, tables, and UI elements

### Adding New Features

1. Create additional views for specific compliance aspects
2. Develop custom search macros for complex compliance queries
3. Add new lookup tables for additional compliance data

## Troubleshooting

### Common Issues

- **XML Syntax Errors**: Ensure all XML attributes have values (e.g., use `selected="selected"` instead of just `selected`)
- **Missing Data**: Verify lookup files are properly formatted and in the correct location
- **JavaScript Errors**: Check browser console for errors in the JavaScript code
- **Permission Issues**: Ensure the app has proper read/write permissions

### Diagnostic Steps

1. Check Splunk's internal logs at `$SPLUNK_HOME/var/log/splunk/`
2. Verify app permissions in Splunk's web interface
3. Test search queries manually to ensure they return expected results
4. Use browser developer tools to debug JavaScript issues

## Support

For issues or feature requests, please contact your system administrator or open an issue in the project repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
