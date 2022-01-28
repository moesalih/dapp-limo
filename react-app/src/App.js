import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { parse } from 'csv-parse/browser/esm/sync';
import './App.css';

const axios = require('axios')




function App() {

	let networkIcon = (n) => 'https://chain-icons.s3.amazonaws.com/' + n.toLowerCase() + '.png'

	const [dapps, setDapps] = useState({});
	const [categories, setCategories] = useState([]);

	useEffect(async () => {
		let response = await axios.get('https://docs.google.com/spreadsheets/d/e/2PACX-1vRV8CRwlasJ_ECVNHr_YALwJAOR7wEeNtVyQ8o9IGwoSqCslG2BIz_ci-SBTcBS3AU3quYmA3ixqofL/pub?gid=75921066&single=true&output=csv')
		let result = parse(response.data, {
			columns: true,
			skip_empty_lines: true
		})
		let keys = Object.keys(result[0])
		let networks = keys.filter(key => key.includes('Network: ')).map(key => key.replace('Network: ', ''))
		let categories = keys.filter(key => key.includes('Category: ')).map(key => key.replace('Category: ', ''))
		result.forEach(dapp => {
			dapp.networks = networks.filter(n => dapp['Network: ' + n] == 'TRUE')
			dapp.categories = categories.filter(n => dapp['Category: ' + n] == 'TRUE')
		})
		console.log(result);
		setCategories(categories)
		setDapps(result);
	}, [])


	return (
		<div className="">

			<Navbar className="mb-3" >
				<Container >
					<Navbar.Brand className="fw-600 text-uppercase">dapp <span className="text-secondary">limo</span></Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav" className="justify-content-end" >
						<Nav className="">
							{/* <Nav.Link href="#home">Home</Nav.Link>
							<Nav.Link href="#link">Link</Nav.Link> */}
							{/* <NavDropdown title="Dropdown" id="basic-nav-dropdown" align="end">
								<NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
								<NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
								<NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
								<NavDropdown.Divider />
								<NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
							</NavDropdown> */}
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>

			<Container className="text-center">

				{categories.map(c =>
					<div key={c}>
						{dapps.length > 0 && dapps.filter(item => item.categories.includes(c)).length > 0 &&
							<div className="fw-700 my-3 opacity-50">{c}</div>
						}
						<div>
							{dapps.length > 0 && dapps.filter(item => item.categories.includes(c)).map((item, index) =>
								<div className="d-inline-block text-center mx-2 mb-4" style={{ width: '6rem' }} key={index}>
									<a href={item.URL} target="_blank" className="d-block px-2 mb-2"><img src={item.Icon} className="border shadow-sm rounded-circle overflow-hidden mw-100" /></a>
									<a href={item.URL} target="_blank" className="fw-500 small text-decoration-none text-reset">{item.Dapp}</a>
									<div>{item.networks.map(n => <img key={n} src={networkIcon(n)} title={n} style={{ height: '1em', margin: '.1em' }} />)}</div>
								</div>
							)}
						</div>
					</div>
				)}


			</Container>

		</div>
	);
}

export default App;
