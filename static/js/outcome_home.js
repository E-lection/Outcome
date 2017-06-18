(function() {
  'use strict';

  const RESULTS_URL = '/outcome/';
  const TURNOUT_URL = '/turnout/';

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

  const SAFEGUARDER_BAR = 'safeguarderBar';
  const EMPLOYMENT_BAR = 'employmentBar';
  const LEMONADE_BAR = 'lemonadeBar';
  const BENDS_BAR = 'bendsBar';

  const SAFEGUARDER_SEATS = 'safeguarderSeats';
  const EMPLOYMENT_SEATS = 'employmentSeats';
  const LEMONADE_SEATS = 'lemonadeSeats';
  const BENDS_SEATS = 'bendsSeats';

  var width = 690,
      height = 559.6;

  var outcome_json, map_data, overall_data, turnout_data;

  // D3 selection vars
  var svg = d3.select('#swinglia_svg')
    .attr('preserveAspectRatio', 'xMinYMid');

  var map = d3.select('#swinglia');

  var tooltip = d3.select('#tooltipContainer')
    .append('div')
    .attr('class', 'map-tooltip');
  tooltip.html('<p><i>Hover over a constituency for more information...</i></p>');

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

  var seat_width = 500,
      seat_height = 150,
      seat_padding = 2;


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
        return 'Other';
    }
  }

  function getPartySeats(party) {
    switch (party) {
      case 'The Safeguarder Party':
        return SAFEGUARDER_SEATS;
      case 'The Employment Party':
        return EMPLOYMENT_SEATS;
      case 'The Lemonade Party':
        return LEMONADE_SEATS;
      case 'The Bends':
        return BENDS_SEATS;
    }
  }

  function getPartySeatBar(party) {
    switch (party) {
      case 'The Safeguarder Party':
        return SAFEGUARDER_BAR;
      case 'The Employment Party':
        return EMPLOYMENT_BAR;
      case 'The Lemonade Party':
        return LEMONADE_BAR;
      case 'The Bends':
        return BENDS_BAR;
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
    let winning_candidate = constituency_data.winning_candidate.first_name;
    winning_candidate += ' ' + constituency_data.winning_candidate.last_name;
    let winning_color = getColourForParty(winning_party);
    let winning_background = getBackgroundForParty(winning_party);

    let content = '<h2 class="' + winning_background + '">';
    content += constituency_data.constituency + '</h2>';

    content += '<p><strong class="' + winning_color + '">Won by: ';
    content += winning_candidate + ' - ' + winning_party;
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
      .attr('font-size', '13px')
      .attr('fill', 'black');
  }

  var seat_scale;

  function fillSeat(party, max_seats) {
    let party_name = party.party;
    let seatId = '#' + getPartySeats(party_name);
    let barId = '#' + getPartySeatBar(party_name);

    let seat_bar_height = seat_scale(party.seats);
    let y_offs = -seat_bar_height + 8.57;
    d3.select(seatId).text(party.seats);
    d3.select(barId)
      .attr('height', seat_bar_height)
      .attr('y', y_offs);
  }

  function fillSeatsChart() {
    let seat_data = overall_data.parties;

    let max_seats = Math.max.apply(Math, seat_data.map(function(d){return d.seats}));
    seat_scale = d3.scale.linear().domain([0, max_seats]).range([0, 150]);
    seat_data.map(fillSeat);
  }

  function createSeatsText() {
    let seat_data = overall_data.parties;
    seatssvg.selectAll('text')
      .data(seat_data)
      .enter()
      .append('text')
      .text(function(d) {
        return getAbbreviation(d.party);
      })
      .attr('text-anchor', 'middle')
      .attr('x', function(d, i) {
        return i * (seat_width / seat_data.length) + 50;
      })
      .attr('y', 10)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', 'black');
  }

  function enableTooltip(constituency) {
    tooltip.style('opacity', 1);

    let constituency_data = map_data.find(function(elem) {
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

  function getConstituencyZoomId(constituency) {
    return constituency + '-zoomed';
  }

  function setVotesCounted() {
    let votes_counted = overall_data.votes_counted;
    let counted_text = 'Votes Counted: ' + votes_counted;
    d3.select('#votesCounted').text(counted_text);
  }

  function getPartyRowId(party) {
    return party.party.split(' ').join('-');
  }

  function getConstituencyRowId(constituency) {
    return constituency.constituency.split(' ').join('-') + '-turnout';
  }

  function formatVoteShare(share) {
    return share.toFixed(2) + '%';
  }

  function fillPartyTable() {
    let parties = overall_data.parties;
    let table = d3.select('#partyTable');

    let rows = table.selectAll('tr')
      .data(parties).enter()
      .append('tr')
      .attr('id', function(d) {
        return getPartyRowId(d);
      });

    rows.append('td')
      .text(function(d) {
        return d.party;
      })
      .append('span')
      .attr('class', function(d) {
        return getBackgroundForParty(d.party) + ' party-box';
      });

    rows.append('td')
      .text(function(d) {
        return d.votes;
      });

    rows.append('td')
      .text(function(d) {
        return d.seats;
      });

    rows.append('td')
      .text(function(d) {
        return formatVoteShare(d.vote_share);
      });
  }

  function updatePartyRow(party) {
    let party_row_id = getPartyRowId(party);
    let row_data = document.getElementById(party_row_id).getElementsByTagName('td');

    // Votes
    row_data[1].innerHTML = party.votes;
    // Seats
    row_data[2].innerHTML = party.seats;
    // Vote Share
    row_data[3].innerHTML = formatVoteShare(party.vote_share);
  }

  function findConstitCount(constituency) {
    let constit_data = map_data.filter(function(d) {
      return d.constituency === constituency.constituency;
    });
    if (constit_data.length) {
      return constit_data[0].total_votes;
    } else {
      return 0;
    }
  }

  function getTurnout(constituency) {
    let percent = (constituency.voted / constituency.registered_voters) * 100;
    return percent.toFixed(2) + '%';
  }

  function fillTurnoutTable() {
    let constituencies = turnout_data;
    let table = d3.select('#turnoutTable');

    let rows = table.selectAll('tr')
      .data(constituencies).enter()
      .append('tr')
      .attr('id', function(d) {
        return getConstituencyRowId(d);
      });

    rows.append('td')
      .text(function(d) {
        return d.constituency;
      });

    rows.append('td')
      .text(function(d) {
        return findConstitCount(d);
      });

    rows.append('td')
      .text(function(d) {
        return d.voted;
      });

    rows.append('td')
      .text(function(d) {
        return getTurnout(d);
      });
  }

  function updateTurnoutTable() {
    turnout_data.map(updateTurnoutRow);
  }

  function updateTurnoutRow(constituency) {
    let constit_row_id = getConstituencyRowId(constituency);
    let row_data = document.getElementById(constit_row_id).getElementsByTagName('td');

    // Counted
    row_data[1].innerHTML = findConstitCount(constituency);
    // Voters
    row_data[2].innerHTML = constituency.voted;
    // turnout
    row_data[3].innerHTML = getTurnout(constituency);
  }

  function updatePartyTable() {
    overall_data.parties.map(updatePartyRow);
  }

  function setOverallData() {
    setVotesCounted();
    let votes_counted = overall_data.votes_counted;
  }

  queue()
    .defer(d3.json, RESULTS_URL)
    .defer(d3.json, TURNOUT_URL).await(ready);

  function ready(error, outcome_json, turnout_json) {
    map_data = outcome_json.map_data;
    map_data.map(fillConstituency);
    turnout_data = turnout_json.turnout;

    overall_data = outcome_json.overall_data;

    setOverallData();
    fillPartyTable();
    fillSeatsChart();
    fillTurnoutTable();

    // Enable tooltip on hover
    map.selectAll('path').on('mousemove', function(d, i) {
      let constituency = this.id;
      enableTooltip(constituency);
    });

    map.selectAll('path').on('mouseover', function(d, i) {
      let scale = 1.4;

      let constituency = this.id;
      let constituency_svg = d3.select('#' + constituency);
      constituency_svg.style('opacity', 0);

      let constit_data = this.getAttribute('d');
      let constit_class = this.getAttribute('class');
      let zoom_constit_id = getConstituencyZoomId(constituency);

      let bbox=this.getBBox();
      let cx=bbox.x+(bbox.width/2),
          cy=bbox.y+(bbox.height/2);   // finding center of element
      let tx =-cx*(scale-1);
      let ty =-cy*(scale-1);
      let translate = tx+','+ty;
      let transform = 'translate(' + translate + ')scale(' + scale + ')';


      d3.select('#swinglia')
        .append('path')
        .style('stroke-width', 0.8)
        .attr('class', constit_class)
        .attr('id', zoom_constit_id)
        .attr('d', constit_data)
        .on('mouseout', function(d) {
          let zoomed_constit = this.id;
          constituency_svg.style('opacity', 1);
          d3.select('#' + zoomed_constit).remove();

          tooltip.html('<p><i>Hover over a constituency for more information...</i></p>');
          d3.select(".map-tooltip-chart").style("height", 0);
          barsvg.attr("width", 0).attr("height", 0);
          barsvg.selectAll("rect,text").remove();
        })
        .transition()
          .duration(500)
          .attr('transform', transform);
    });

    map.on('mouseout', function(d) {

    })

  }

  function refresh(error, outcome_json, turnout_json) {
    map_data = outcome_json.map_data;
    map_data.map(fillConstituency);
    turnout_data = turnout_json.turnout;

    overall_data = outcome_json.overall_data;

    setVotesCounted();
    fillPartyTable();
    updatePartyTable();
    updateTurnoutTable();
    fillSeatsChart();
  }

  setInterval(function() {
    queue()
      .defer(d3.json, RESULTS_URL)
      .defer(d3.json, TURNOUT_URL)
      .await(refresh);
  }, 1000);
}());
