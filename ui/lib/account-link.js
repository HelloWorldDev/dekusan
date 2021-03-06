module.exports = function (address, network) {
  const net = parseInt(network)
  let link
  switch (net) {
    case 1: // main net
    case 237: // main net
      link = `https://dexscan.app/address/${address}`
      break
    case 2: // test net
    case 238: // test net
    default:
      link = `https://testnet.dexscan.app/address/${address}`
      break
  }

  return link
}
