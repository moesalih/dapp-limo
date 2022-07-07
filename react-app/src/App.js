import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, NavLink, Spinner } from 'react-bootstrap';
import { parse } from 'csv-parse/browser/esm/sync';
import './App.css';

const axios = require('axios')




function App() {

	let networkIcon = (n) => 'https://chain-icons.s3.amazonaws.com/' + n.toLowerCase() + '.png'

	const [dapps, setDapps] = useState([]);
	const [categories, setCategories] = useState([]);
	const [networks, setNetworks] = useState([]);
	const [currentNetwork, setCurrentNetwork] = useState(null);

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
		console.log(result)
		setNetworks(networks)
		setCategories(['Favorites', ...categories])

		refreshFavoriteDapps(result, categories)
		setDapps(result)
	}, [])

	let currentNetworkDapps = () => currentNetwork ? dapps.filter(dapp => dapp.networks.includes(currentNetwork)) : dapps

	let getFavorites = () => JSON.parse(window.localStorage.getItem('favorites')) || []
	let setFavorites = (favorites) => window.localStorage.setItem('favorites', JSON.stringify(favorites))
	let isFavorite = (item) => getFavorites().includes(item)
	let toggleFavorite = (item) => {
		let favorites = getFavorites()
		if (favorites.includes(item)) favorites = favorites.filter(i => i != item)
		else favorites.push(item)
		console.log('favorites', favorites)
		setFavorites(favorites)

		refreshFavoriteDapps(dapps, categories)
		setDapps([...dapps])
	}
	let refreshFavoriteDapps = (dapps, categories) => {
		dapps.forEach(dapp => {
			dapp.categories = categories.filter(n => dapp['Category: ' + n] == 'TRUE')
			if (isFavorite(dapp.Dapp)) {
				dapp.categories.push('Favorites')
			}
		})
	}

	function dappBlock(item, index) {
		return (
			<div className="d-inline-block bg-light align-top text-center pb-2 p-1 rounded m-1 position-relative" style={{ width: '6.8rem' }} key={index}>
				<div className="p-3 pb-2"><a href={item.URL} target="_blank" className=""><img src={item.Icon} className="border shadow-sm rounded-circle overflow-hidden w-100" /></a></div>
				<a href={item.URL} target="_blank" className="d-block fw-600 text-decoration-none text-reset lh-sm mb-1">{item.Dapp}</a>
				<div className="text-secondary smaller lh-sm mb-1">{item.Description}</div>
				<div className="mb-1">{item.networks.map(n => <img key={n} src={networkIcon(n)} title={n} className="rounded-circle" style={{ height: '.9em', margin: '.1em' }} />)}</div>
				<div className="position-absolute top-0 end-0 smaller text-secondary opacity-50 lh-1 p-1">
					<i className={isFavorite(item.Dapp) ? "bi bi-star-fill" : "bi bi-star"} onClick={() => toggleFavorite(item.Dapp)}></i>
				</div>
			</div>
		)
	}



	return (
		<div className="">

			<Navbar className="mb-3" >
				<Container >
					<Navbar.Brand className="fw-900 text-uppercase">dapp <span className="opacity-50">limo</span></Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav" className="justify-content-end" >
						<Nav className="">
							<Dropdown as={NavItem} align="end">
								<Dropdown.Toggle as={NavLink} className="small fw-500">{currentNetwork ? <><img src={networkIcon(currentNetwork)} title={currentNetwork} className="align-text-top rounded-circle me-2" style={{ height: '1.3em' }} />{currentNetwork}</> : 'All Networks'} </Dropdown.Toggle>
								<Dropdown.Menu className="shadow ">
									<Dropdown.Item className="small" onClick={() => { setCurrentNetwork(null) }}>All Networks</Dropdown.Item>
									{networks && networks.map(n => <Dropdown.Item key={n} className="small" onClick={() => { setCurrentNetwork(n) }} ><img src={networkIcon(n)} title={n} className="align-text-top rounded-circle me-2" style={{ height: '1.3em' }} />{n}</Dropdown.Item>)}
								</Dropdown.Menu>
							</Dropdown>
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>


			<Container className="text-center mb-5">

				{categories.length == 0 && <Spinner animation="border" variant="secondary" className="my-5" />}

				{categories.map(c =>
					<div key={c}>
						{currentNetworkDapps().length > 0 && currentNetworkDapps().filter(item => item.categories.includes(c)).length > 0 &&
							<div className="d-flex justify-content-center align-items-center text-secondary opacity-75 mt-4 mb-1">
								<hr className="w-25  opacity-10 m-0" />
								<div className="small fw-700   mx-3 ">{c}</div>
								<hr className="w-25  opacity-10 m-0" />
							</div>
						}
						<div>
							{currentNetworkDapps().length > 0 && currentNetworkDapps().filter(item => item.categories.includes(c)).map(dappBlock)}
						</div>
					</div>
				)}



				<div className="my-5 small text-muted">
					Created by <a href="https://twitter.com/0xMoe_" target="_blank" className="text-reset text-decoration-none fw-700 my-2">MOΞ</a>
					<span className="mx-2 text-black-50">·</span>
					<a href="https://twitter.com/dapplimo" target="_blank" className="text-reset text-decoration-none  ">Twitter</a>
					<span className="mx-2 text-black-50">·</span>
					<a href="https://docs.google.com/spreadsheets/d/1fqGr2kD53tytTp4QUWKw-Ui6D6tJueBYrhJflvK4ERs/edit#gid=75921066" target="_blank" className="text-reset text-decoration-none  ">Data</a>
					<span className="mx-2 text-black-50">·</span>
					<a href="https://github.com/moesalih/dapp-limo" target="_blank" className="text-reset text-decoration-none  ">GitHub</a>
				</div>

			</Container>

		</div>
	);
}


export default App;
