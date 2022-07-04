// this is the handler that is being exported and used in the lambda props 'hello.handler'
exports.handler = async function(event) {
    console.log("request:", JSON.stringify(event, undefined, 2));
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: `Hello HOTSWAP, CDK! You've hit ${event.path}\n`
    };
  };