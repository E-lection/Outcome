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
    .attr('class', 'map-tooltip');
  tooltip.html(' ');

  // Barchart
  var barchart = d3.select('#tooltipContainer')
    .append('div')
    .attr('class', 'map-tooltip-chart')
    .style('opacity', 0)
    .style('height', 0);

  var bar_width = 260,
      bar_height = 150,
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

  function getAbbreviation(party) {
    switch (party) {
      case 'The Safeguarder Party':
        return 'SP';
      case 'The Employment Party':
        return 'EP';
      case 'The Lemonade Party':
        return 'LP';
      case 'The Bends':
        return 'TB';
      default:

    }
  }

  function sortByVotes(a, b) {
    if (a.votes < b.votes) {
      return 1;
    } else if (a.votes > b.votes) {
      return -1;
    } else {
      return 0;
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

  function createConstituencyBarChart(constituency_data) {
    let votes_data = constituency_data.votes;
    votes_data.sort(sortByVotes)

    let max_votes = constituency_data.winning_votes;

    createConstitBars(votes_data, max_votes);
    createConstitText(votes_data);
  }

  function createConstitBars(votes_data, max_votes) {

    let bar_scale = d3.scale.linear().domain([0, max_votes]).range([0, 160]);

    let rect_height = bar_height / votes_data.length - bar_padding;
    barsvg.attr('width', bar_width).attr('height', bar_height)
      .selectAll('rect')
      .data(votes_data)
      .enter()
      .append('rect')
      .attr('x', 100)
      .attr('y', function(d, i) {
        return i * (bar_height / votes_data.length);
      })
      .attr('width', function(d) {
        return bar_scale(d.votes);
      })
      .attr('height', rect_height)
      .attr('class', function(d) {
        return getFillForParty(d.candidate.party);
      });
  }

  function createConstitText(votes_data) {
    barsvg.selectAll('text')
      .data(votes_data)
      .enter()
      .append('text')
      .text(function(d) {
        return getAbbreviation(d.candidate.party) + ': ' + d.votes;
      })
      .attr('text-anchor', 'left')
      .attr('x', 30)
      .attr('y', function(d, i) {
        let base_y = i * (bar_height / votes_data.length - bar_padding) + 30;
        if (votes_data.length === 2) {
          base_y += 10;
        }
        return base_y;
      })
      .attr('font-size', '12px')
      .attr('fill', 'black');
  }

  function enableTooltip(constituency, outcome) {
    tooltip.style('opacity', 1);

    let constituency_data = outcome.find(function(elem) {
      return elem['constituency'].split(' ').join('_') === constituency;
    });

    if (constituency_data !== undefined) {
      d3.select('.map-tooltip-chart')
        .style('opacity', 1)
        .style('height', 'auto');

        let content = generateConstituencyContent(constituency_data);
        tooltip.html(content);

        createConstituencyBarChart(constituency_data);
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

    map.on('mouseout', function(d) {
        tooltip.html(" ");
        d3.select(".map-tooltip-chart").style("height", 0);
        barsvg.attr("width", 0).attr("height", 0);
        barsvg.selectAll("rect,text").remove();
    })

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
