const handler = {
  name: "Greet user",
  description: "Greet the user",
  method: "GET",
  category: [],
  alias: ["data"],
  exec: async (req, res) => {
    res.json({
      status: 200,
      message: "Welcome to DitzzyAPI, Lets get started by visit our documentation on: https://api.ditzzy.my.id/docs"
    })
  }  
}

export default handler