(function() {
  'use strict';

  const SAFEGUARDER_COLOR = 'safeguard-color';
  const EMPLOYMENT_COLOR = 'employment-color';
  const LEMONADE_COLOR = 'lemonade-color';
  const BENDS_COLOR = 'bends-color';

  const SAFEGUARDER_RGBA = 'safeguard-rgba';
  const EMPLOYMENT_RGBA = 'employment-rgba';
  const LEMONADE_RGBA = 'lemonade-rgba';
  const BENDS_RGBA = 'bends-rgba';

  const SAFEGUARDER_FILL = 'safeguard-fill';
  const EMPLOYMENT_FILL = 'employment-fill';
  const LEMONADE_FILL = 'lemonade-fill';
  const BENDS_FILL = 'bends-fill';

  var width = 690,
      height = 559.6;

  // D3 selection vars
  var svg = d3.select('#swinglia_svg')
    .attr('preserveAspectRatio', 'xMinYMid');

  var map = d3.select('#swinglia');

  var tooltip = d3.select('#tooltipContainer')
    .append('div')
    .attr('class', 'tooltip');
  tooltip.html(' ');

  // Barchart
  var barchart = d3.select('#tooltipContainer')
    .append('div')
    .attr('class', 'tooltip-chart')
    .style('opacity', 0)
    .style('height', 0);

  var bar_width = 260,
      bar_height = 200,
      bar_padding = 1;

  var barsvg = barchart
    .append('svg:svg')
    .attr('width', bar_width)
    .attr('height', bar_height)
    .attr('viewBox', '0 0 ' + bar_width + ' ' + bar_height)
    .attr('preserveAspectRatio', 'xMinYMid')
    .attr('id', 'constituency-result')
    .attr('class', 'constituency-result');


  function getColourForParty(party) {
    switch (party) {
      case 'The Safeguarder Party':
        return SAFEGUARDER_COLOR;
      case 'The Employment Party':
        return EMPLOYMENT_COLOR;
      case 'The Lemonade Party':
        return LEMONADE_COLOR;
      case 'The Bends':
        return BENDS_COLOR;
      default:

    }
  }

  function getBackgroundForParty(party) {
    switch (party) {
      case 'The Safeguarder Party':
        return SAFEGUARDER_RGBA;
      case 'The Employment Party':
        return EMPLOYMENT_RGBA;
      case 'The Lemonade Party':
        return LEMONADE_RGBA;
      case 'The Bends':
        return BENDS_RGBA;
      default:

    }
  }

  function getFillForParty(party) {
    switch (party) {
      case 'The Safeguarder Party':
        return SAFEGUARDER_FILL;
      case 'The Employment Party':
        return EMPLOYMENT_FILL;
      case 'The Lemonade Party':
        return LEMONADE_FILL;
      case 'The Bends':
        return BENDS_FILL;
      default:

    }
  }

  function generateConstituencyContent(constituency_data) {
    let winning_party = constituency_data.winning_candidate.party;
    let winning_color = getColourForParty(winning_party);
    let winning_background = getBackgroundForParty(winning_party);

    let content = '<h2 class="' + winning_background + '">';
    content += constituency_data.constituency + '</h2>';

    content += '<p><strong class="' + winning_color + '">Won by: ';
    content += winning_party;
    content += '</strong>';

    content += '<br><span>Votes: </span><strong>';
    content += constituency_data.total_votes;
    content += '</strong>';

    content += '</p>';

    return content;
  }

  function fillConstituency(constituency) {
    let winning_party = constituency.winning_candidate.party;
    let party_fill = getFillForParty(winning_party);

    let constituency_id = '#' + constituency.constituency.split(' ').join('_');
    d3.select(constituency_id).attr('class', party_fill);
  }

  function enableTooltip(constituency, outcome) {
    tooltip.style('opacity', 1);

    let constituency_data = outcome.find(function(elem) {
      return elem['constituency'].split(' ').join('_') === constituency;
    });

    if (constituency_data !== undefined) {
      d3.select('.tooltip-chart')
        .style('opacity', 1)
        .style('height', 'auto');

        let content = generateConstituencyContent(constituency_data);
        tooltip.html(content);
    }
  }

  queue().defer(d3.json, 'http://results.eelection.co.uk/outcome/').await(ready);

  var outcome_json, outcome;

  function ready(error, outcome_json) {
    outcome = outcome_json.map_data;

    outcome.map(fillConstituency);

    // Enable tooltip on hover
    map.selectAll('path').on('mousemove', function(d, i) {
      let constituency = this.id;
      enableTooltip(constituency, outcome);
    });

  }

  /* this code automatically resizes the content according to the viewport dimensions. It has been commented out for Codepen, but can be used elsewhere.
  var resizeMap = $("#sizer-map"),
    aspectMap = resizeMap.width() / resizeMap.height(),
    containerResizeMap = resizeMap.parent(),
    resizeLegend = $("#sizer-legend"),
    aspectLegend = resizeLegend.width() / resizeLegend.height(),
    containerResizeLegend = $("#electionLegend");

  $(window).on("resize", function() {
    var targetContainerResizeMapWidth = containerResizeMap.width();
    resizeMap.attr("width", targetContainerResizeMapWidth);
    resizeMap.attr("height", Math.round(targetContainerResizeMapWidth / aspectMap));
    var targetContainerResizeLegendWidth = containerResizeLegend.width();
    resizeLegend.attr("width", targetContainerResizeLegendWidth);
    resizeLegend.attr("height", Math.round(targetContainerResizeLegendWidth / aspectLegend));
  }).trigger("resize");
  */
}());
