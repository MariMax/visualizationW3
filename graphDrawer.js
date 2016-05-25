var container = document.getElementById('graph');
var picture = document.getElementsByClassName('picture')[0];
var description = document.getElementsByClassName('description')[0];

var width = container.clientWidth,
    height = container.clientHeight;

var force = d3.layout.force()
    .charge(-100)
    // .charge( function(d) {
    //     return  Math.sqrt(d.count*Math.random())
    // } )
    .linkDistance(50)
    .gravity(0.15)
    .linkStrength(2)
    .size([width, height]);
    // .linkDistance(10)
    // .linkStrength(2)
    // .size([width, height]);

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

    // var kinds = ["liryka", "epika", "dramat"];
    //
    // var kind_max = {};

    // for(var i = 0; i < kinds.length; i++){
    //     kind_max[kinds[i]] = d3.max(graph.nodes, function(d){
    //         return d[kinds[i]] / d.count;
    //     });
    // }

    // var kind_to_color = function(d){
    //     return d3.rgb(
    //         255 * d.liryka / d.count / kind_max.liryka,
    //         0.9 * 255 * d.epika / d.count / kind_max.epika,  // 90% not to make it too bright
    //         255 * d.dramat / d.count / kind_max.dramat
    //     )
    // };

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
        .style("stroke-width", function(d) { return 2/*2 * d.strength;*/ });

    var node = main.selectAll(".node_circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("class", "node_circle")
        .attr("r", function(d) { return 1.5 * Math.sqrt(d.count||4); })
        .style("fill", function(d){ return kind_to_color2(d).toString(); } )
        .on("mouseover", function(d) { mouseover_node(d); })
        .on("mouseout", function(d) { mouseout_node(d) })
        // .on("dblclick", function(d){
        //   window.open('http://wolnelektury.pl/katalog/motyw/' + d.name + '/', '_blank');
        //   window.focus();
        // })
        // .on("dblclick", function(d){ window.location.href=('http://wolnelektury.pl/katalog/motyw/' + d.name + '/') })
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
        // link.attr("d", function(d) {
        //     return "M" + d[0].x + "," + d[0].y
        //         + "S" + d[1].x + "," + d[1].y
        //         + " " + d[2].x + "," + d[2].y;
        // });
        // node
        //   .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        label.attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });
    });

    var mouseover_node = function(z){

        var neighbors = {};
        neighbors[z.index] = true;
        // console.log(z);
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

    var mouseout_node = function(z){
        link
            .style("stroke-opacity", 0.2);

        node
            .style("stroke-width", 1);

        label
            .attr("font-size", 10)
            .style("fill-opacity", 1)

    };

    // var legend = svg.append("g")
    //     .attr("class", "legend")
    //     .attr("transform", function(d) { return "translate(800,400)"; });
    //
    // legend.append("text")
    //     .attr("class", "legend")
    //     .attr("x", 0)
    //     .attr("y", -50)
    //     .style("text-anchor", "middle")
    //     .text("link = frequent co-occurrence");
    //
    // legend.append("text")
    //     .attr("class", "legend")
    //     .attr("x", 0)
    //     .attr("y", -10)
    //     .style("text-anchor", "middle")
    //     .text("double click to open a theme");
    //
    // legend.append("circle")
    //     .attr("class", "node_count")
    //     .attr("cx", -60)
    //     .attr("cy", 50)
    //     .attr("r", function(d) { return 0.5 * Math.sqrt(200); });
    //
    // legend.append("text")
    //     .attr("class", "legend")
    //     .attr("x", 90)
    //     .attr("y", 54)
    //     .style("text-anchor", "end")
    //     .text("200  occurrences");
    //
    // legend.append("circle")
    //     .attr("class", "node_count")
    //     .attr("cx", -60)
    //     .attr("cy", 90)
    //     .attr("r", function(d) { return 0.5 * Math.sqrt(2000); });
    //
    // legend.append("text")
    //     .attr("class", "legend")
    //     .attr("x", 90)
    //     .attr("y", 94)
    //     .style("text-anchor", "end")
    //     .text("2000 occurrences");
    //
    // var legend_kinds_data = [{pos: [1, 0, 0], name: "poem"},
    //     {pos: [0, 1, 0], name: "novel"},
    //     {pos: [0, 0, 1], name: "drama"},
    //     {pos: [2/3, 2/3, 2/3], name: ""}]
    //
    // var legend_kinds = legend.selectAll("g.kind")
    //     .data(legend_kinds_data)
    //
    // legend_kinds.enter().append("g")
    //     .attr("class", "kind")
    //
    // legend_kinds.append("circle")
    //     .attr("class", "node_circle")
    //     .attr("cx", function(d) { return 20 * (Math.sqrt(3) / 2) * (d.pos[2] - d.pos[0]); })
    //     .attr("cy", function(d) { return 180 + 20 * ( d.pos[0] / 2 - d.pos[1] + d.pos[2] / 2 ); })
    //     .attr("r", function(d) { return 0.5 * Math.sqrt(1000); })
    //     .style("fill", function(d) { return d3.rgb(255 * d.pos[0], 0.9 * 255 * d.pos[1], 255 * d.pos[2]).toString()});
    //
    // legend_kinds.append("text")
    //     .attr("class", "legend")
    //     .attr("x", function(d) { return 65 * (Math.sqrt(3) / 2) * (1.1 * d.pos[2] - d.pos[0]); })
    //     .attr("y", function(d) { return 180 + 40 * ( d.pos[0] / 2 - d.pos[1] + d.pos[2] / 2 ); })
    //     .style("text-anchor", "middle")
    //     .text(function(d) { return d.name })
    //
    // legend.append("a")
    //     .attr("xlink:href", "https://github.com/stared/wizualizacja-wolnych-lektur")
    //     .append("text")
    //     .attr("class", "legend")
    //     .attr("y", 270)
    //     .style("text-anchor", "middle")
    //     .style("text-decoration", "underline")
    //     .text("CC BY Piotr Migdał (2013)");

});
