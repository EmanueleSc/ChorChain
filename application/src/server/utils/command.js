const cp = require('child_process')

/**
 * Execute .sh file (async wrapper).
 * @param {String} shFilePath
 * @param {String[]} args
 * @return {Object} { stdout: String, stderr: String }
 */
async function shExec(shFilePath, args) {
    return new Promise((resolve, reject) => {
        //let cmd = 'sh ' + shFilePath // tested on mac (ubuntu not works)
        let cmd = 'bash ' + shFilePath // tested on ubuntu
        if(args && args.length !== 0) args.forEach(a => cmd += ' ' + a)

        cp.exec(cmd, (err, stdout, stderr) => {
            if (err) reject(err)
            else resolve({ stdout, stderr })
        })
    })
}

module.exports = {
    shExec
}
