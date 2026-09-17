/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.37809709068708, "KoPercent": 0.621902909312925};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9490905734853541, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9485536954788748, 500, 1500, "03 - Selecionar voo (purchase)"], "isController": false}, {"data": [0.946287742226228, 500, 1500, "01 - Home"], "isController": false}, {"data": [0.953114382785957, 500, 1500, "02 - Escolher voos (reserve)"], "isController": false}, {"data": [0.9484101976511028, 500, 1500, "04 - Confirmar compra (confirmation)"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 70429, 438, 0.621902909312925, 551.668261653579, 223, 41376, 371.0, 554.0, 695.0, 28179.460000000086, 220.7729514029297, 1323.4356320442319, 57.98798988318584], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["03 - Selecionar voo (purchase)", 17562, 112, 0.6377405762441636, 567.339426033485, 232, 41376, 364.0, 496.0, 566.0, 1122.3299999999908, 55.32209796818396, 361.531540400063, 15.835878435580407], "isController": false}, {"data": ["01 - Home", 17752, 94, 0.5295178008111762, 538.917361424064, 227, 32126, 358.0, 501.0, 586.0, 1099.570000000036, 55.80635020433826, 258.7611501886199, 6.396757603740961], "isController": false}, {"data": ["02 - Escolher voos (reserve)", 17660, 103, 0.5832389580973952, 540.6563420158559, 240, 41129, 363.0, 489.0, 553.9500000000007, 912.0, 55.73439373855962, 400.35705277468753, 13.419446877169728], "isController": false}, {"data": ["04 - Confirmar compra (confirmation)", 17455, 129, 0.739043254081925, 560.0101403609302, 223, 40086, 364.0, 497.0, 566.0, 1140.1999999999935, 55.11107462648867, 310.21734790187986, 22.68477444083808], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 24,811 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 2,140 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 10,750 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 10,621 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 10,669 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 25,637 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 2,104 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 23,592 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 10,786 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 10,757 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 10,563 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 27,656 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 408, 93.15068493150685, 0.5793068196339576], "isController": false}, {"data": ["The operation lasted too long: It took 30,658 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to blazedemo.com:443 [blazedemo.com/216.239.38.21, blazedemo.com/216.239.34.21, blazedemo.com/216.239.36.21, blazedemo.com/216.239.32.21] failed: Connect timed out", 4, 0.91324200913242, 0.00567947862386233], "isController": false}, {"data": ["The operation lasted too long: It took 10,637 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 3,010 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 10,748 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 10,692 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 10,584 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 4,424 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 10,678 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 10,896 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 10,799 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 10,902 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 21,636 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 10,680 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}, {"data": ["The operation lasted too long: It took 20,605 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.228310502283105, 0.0014198696559655825], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 70429, 438, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 408, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to blazedemo.com:443 [blazedemo.com/216.239.38.21, blazedemo.com/216.239.34.21, blazedemo.com/216.239.36.21, blazedemo.com/216.239.32.21] failed: Connect timed out", 4, "The operation lasted too long: It took 24,811 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,140 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 10,750 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["03 - Selecionar voo (purchase)", 17562, 112, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 110, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to blazedemo.com:443 [blazedemo.com/216.239.38.21, blazedemo.com/216.239.34.21, blazedemo.com/216.239.36.21, blazedemo.com/216.239.32.21] failed: Connect timed out", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["01 - Home", 17752, 94, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 94, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["02 - Escolher voos (reserve)", 17660, 103, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 102, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to blazedemo.com:443 [blazedemo.com/216.239.38.21, blazedemo.com/216.239.34.21, blazedemo.com/216.239.36.21, blazedemo.com/216.239.32.21] failed: Connect timed out", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["04 - Confirmar compra (confirmation)", 17455, 129, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 102, "The operation lasted too long: It took 24,811 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,140 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 10,750 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 10,621 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
