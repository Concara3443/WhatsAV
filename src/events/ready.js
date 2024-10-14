module.exports = client => {
  try{
    console.log("##############################");
    console.log("#                            #");
    console.log("#      Bot is ready!         #");
    console.log("#                            #");
    console.log("##############################");
  } catch (e){
    console.log(String(e.stack))
  }
}