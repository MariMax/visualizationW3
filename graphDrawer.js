var container = document.getElementById('graph');
var picture = document.getElementsByClassName('picture')[0];
var description = document.getElementsByClassName('description')[0];

var width = container.clientWidth,
    height = container.clientHeight;

var force = d3.layout.force()
    .charge(-100)
    .linkDistance(50)
    .gravity(0.15)
    .linkStrength(2)
    .size([width, height]);

var zoom = d3.behavior.zoom()
    .scaleExtent([-10, 10])
    .on("zoom", zoomed);

function zoomed() {
    main.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

var svg = d3.select("#graph").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(zoom);

var main = svg.append("g")
    .attr("class", "graph");

d3.json("moviesGraph.json", function(error, graph) {

    var kind_to_color2 = function(d){
        return d.type==="movie"?d3.rgb(255,0,0):d3.rgb(0,255,0)
    };

    force
        .nodes(graph.nodes)
        .links(graph.links)
        .start();

    var link = main.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function() { return 2 });

    var node = main.selectAll(".node_circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("class", "node_circle")
        .attr("r", function(d) { return 1.5 * Math.sqrt(d.count||4); })
        .style("fill", function(d){ return kind_to_color2(d).toString(); } )
        .on("mouseover", function(d) { mouseover_node(d); })
        .on("mouseout", function(d) { mouseout_node(d) })
        .call(force.drag);

    var label = main.selectAll(".node_label")
        .data(graph.nodes)
        .enter().append("text")
        .attr("class", "node_label")
        .attr("dx", function(d) { return 2 + 1.5 * Math.sqrt(d.count||1); })
        .attr("dy", ".4em")
        .attr("font-family", "Verdana")
        .attr("font-size", 10)
        .style("fill", "#000000")
        .text(function(d) { return d.type==='movie'?d.name:' '; });

    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        label.attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });
    });

    var mouseover_node = function(z){

        var neighbors = {};
        neighbors[z.index] = true;
        description.innerText = z.name;
        if (z.type === 'movie'){
            description.innerText = description.innerText+'\n'+z.overview;
        }
        picture.innerHTML = '<img src="//image.tmdb.org/t/p/w300'+z.picture+'width="300">';

        link.filter(function(d){
                if (d.source == z) {
                    neighbors[d.target.index] = true
                    return true
                } else if (d.target == z) {
                    neighbors[d.source.index] = true
                    return true
                } else {
                    return false
                }
            })
            .style("stroke-opacity", 1);

        node.filter(function(d){ return neighbors[d.index] })
            .style("stroke-width", 3);

        label.filter(function(d){ return !neighbors[d.index] })
            .style("fill-opacity", 0.2);
        
        label.filter(function(d){ return neighbors[d.index] })
            .attr("font-size", 16)

    };

    var mouseout_node = function(){
        link
            .style("stroke-opacity", 0.2);

        node
            .style("stroke-width", 1);

        label
            .attr("font-size", 10)
            .style("fill-opacity", 1)

    };

});
