

( async ()=> {

	const execSync = require( "child_process" ).execSync;

	const default_gateway = execSync( `route -n | awk '$4 == "UG" {print $2}'` ).toString().trim();
	const defualt_interface = execSync( `ip link | awk -F: '$0 !~ "lo|vir|wl|^[^0-9]"{print $2;getline}'` ).toString().trim();
	const google_home_ip = execSync( `sudo nmap -sn ${ default_gateway }/24 | grep 'AD:B0' -A 1 | tail -1 | awk '{print $(NF)}'` ).toString().trim();

	console.log( default_gateway );
	console.log( defualt_interface );
	console.log( google_home_ip );

})();