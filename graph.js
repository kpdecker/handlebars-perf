/*global _, Rickshaw */
var Graph = (function() {
  const GRAPH_WIDTH = 1024;

  var palette = new Rickshaw.Color.Palette( { scheme: 'cool' } );

  function xFormatter(result) {
    return function(x) {
      var entry = result[x] || {};
      return entry.tag || entry.sha;
    };
  }
  function sizeFormatter(y) {
    var abs_y = Math.abs(y);
    if (abs_y >= 1048576)           { return (y / 1048576).toFixed(2) + "M"; }
    else if (abs_y >= 1024)         { return (y / 1024).toFixed(2) + "K"; }
    else if (abs_y < 1 && y > 0)    { return y.toFixed(2); }
    else if (abs_y === 0)           { return ''; }
    else                        { return y; }
  }
  function throughputFormatter(y) {
    var str = Math.ceil(y).toString();
    return str.split('').map(function(value, index) {
      var distance = str.length - index - 1;
      if (!distance || distance % 3) {
        return value;
      } else {
        return value + ',';
      }
    }).join('') + ' ops/sec';
  }

  function versionXAxis(result, graph) {
    var xAxis = new Rickshaw.Graph.Axis.X({
      graph: graph,
      tickFormat: xFormatter(result)
    });
    xAxis.render();
  }
  function sizeYAxis(graph) {
    var yAxis = new Rickshaw.Graph.Axis.Y({
      graph: graph,
      tickFormat: sizeFormatter
    });
    yAxis.render();
  }

  var template = Handlebars.compile(document.getElementById('graph-template').innerText),
      id = 0;

  function renderGraph(caption) {
    var name = 'graph_' + (id++),
        womb = document.createElement('div');
    womb.innerHTML = template({name: name, caption: caption});
    document.body.appendChild(womb);
    return name;
  }
  function renderAddons(name, graph) {
    var legend = new Rickshaw.Graph.Legend( {
      graph: graph,
      element: document.getElementById(name + '-legend')
    });

    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
      graph: graph,
      legend: legend
    });
  }



  return {
    generateData: function(data, name, color) {
      return {
        name: name,
        color: color || palette.color(),
        data: _.map(data.result, function(result, index) { return { x: index, y: result[name] }; })
      };
    },

    sizeGraph: function(caption, series, data) {
      var name = renderGraph(caption);

      var graph = new Rickshaw.Graph( {
        element: document.getElementById(name + '-graph'), 
        renderer: 'line',
        width: GRAPH_WIDTH, 
        height: 200, 
        series: series
      });
      renderAddons(name, graph);
      versionXAxis(data.result, graph);
      sizeYAxis(graph);
      graph.render();

      var hoverDetail = new Rickshaw.Graph.HoverDetail( {
        graph: graph,
        xFormatter: xFormatter(data.result),
        yFormatter: sizeFormatter
      });
    },
    throughputGraph: function(caption, series, data) {
      var name = renderGraph(caption);

      var graph = new Rickshaw.Graph( {
        element: document.getElementById(name + '-graph'), 
        renderer: 'line',
        width: GRAPH_WIDTH, 
        height: 200, 
        series: series
      });
      renderAddons(name, graph);
      versionXAxis(data.result, graph);
      var yAxis = new Rickshaw.Graph.Axis.Y({
        graph: graph
      });
      yAxis.render();
      graph.render();

      var hoverDetail = new Rickshaw.Graph.HoverDetail( {
        graph: graph,
        xFormatter: xFormatter(data.result),
        yFormatter: throughputFormatter
      });
    }
  };
})();
