const { default: axios } = require('axios');

// Parse a TCP dump
module.exports.parseTcpdump = async(tcpdump) => {

    try {
            const packets = tcpdump.split("\n");
            const httpPackets = packets.filter((packet) => packet.includes("HTTP/"));
          
            const httpObjects = httpPackets.map((httpPacket) => {
              const lines = httpPacket.split("\n");
              const isRequest = lines[0].startsWith("GET") || lines[0].startsWith("POST") || lines[0].startsWith("PUT") || lines[0].startsWith("DELETE");
          
              if (isRequest) {
                const [method, path, httpVersion] = lines[0].split(" ");
                const headers = {};
                let body = "";
          
                for (let i = 1; i < lines.length; i++) {
                  if (lines[i].trim() === "") {
                    body = lines.slice(i + 1).join("\n");
                    break;
                  } else {
                    const [name, value] = lines[i].split(": ");
                    headers[name] = value;
                  }
                }
          
                const [endpoint, queryParams] = path.split("?");
                const host = headers.Host;
          
                return {
                  type: "request",
                  method: method,
                  host: host,
                  endpoint: endpoint,
                  queryParams: queryParams,
                  headers: headers,
                  body: body,
                };
              } else {
                const [httpVersion, statusCode, statusMessage] = lines[0].split(" ");
                const headers = {};
                let body = "";
          
                for (let i = 1; i < lines.length; i++) {
                  if (lines[i].trim() === "") {
                    body = lines.slice(i + 1).join("\n");
                    break;
                  } else {
                    const [name, value] = lines[i].split(": ");
                    headers[name] = value;
                  }
                }
          
                return {
                  type: "response",
                  httpVersion: httpVersion,
                  statusCode: statusCode,
                  statusMessage: statusMessage,
                  headers: headers,
                  body: body,
                };
              }
            });
          
            return httpObjects;         

        
    } catch (error) {
        return [null, error];
    }
};





