import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, NavLink, Spinner, Form } from 'react-bootstrap';
import { parse } from 'csv-parse/browser/esm/sync';
import './App.css';

const axios = require('axios')




function App() {

	let networkIcon = (n) => 'https://chain-icons.s3.amazonaws.com/' + n.toLowerCase() + '.png'

	const [dapps, setDapps] = useState([]);
	const [categories, setCategories] = useState([]);
	const [networks, setNetworks] = useState([]);
	const [currentNetwork, setCurrentNetwork] = useState(null);
	const [searchText, setSearchText] = useState('')

	let filteredDapps = [...dapps]
	if (currentNetwork) filteredDapps = filteredDapps.filter(dapp => dapp.networks.includes(currentNetwork))
	if (searchText) filteredDapps = filteredDapps.filter(dapp => (`${dapp.Dapp} ${dapp.Description} ${dapp.categories.join(' ')}`).toLowerCase().includes(searchText.toLowerCase()))


	const [gasPrice, setGasPrice] = useState(0)
	useEffect(async () => {
		let { data } = await axios.get('https://api.etherscan.io/api?module=gastracker&action=gasoracle')
		if (data && data.result && data.result.SafeGasPrice) setGasPrice(parseInt(data.result.SafeGasPrice))
	}, [])


	useEffect(async () => {
		let response = await axios.get('https://docs.google.com/spreadsheets/d/e/2PACX-1vRV8CRwlasJ_ECVNHr_YALwJAOR7wEeNtVyQ8o9IGwoSqCslG2BIz_ci-SBTcBS3AU3quYmA3ixqofL/pub?gid=75921066&single=true&output=csv')
		let result = parse(response.data, {
			columns: true,
			skip_empty_lines: true
		})
		result = result.filter(item => !!item.Dapp)
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
			<div className="d-inline-block bg-body-tertiary  align-top text-center pb-2 p-1 rounded m-1 position-relative" style={{ width: '6.8rem' }} key={index}>
				<div className="p-3 pb-2"><a href={item.URL} target="_blank" className=""><img src={item.Icon} className="shadow-sm rounded-circle overflow-hidden w-100" /></a></div>
				<a href={item.URL} target="_blank" className="d-block fw-600 text-decoration-none text-resetx text-body-emphasis lh-sm mb-1">{item.Dapp}</a>
				<div className="text-secondary smaller lh-sm mb-1">{item.Description}</div>
				<div className="mb-1">{item.networks.map(n => <img key={n} src={networkIcon(n)} title={n} className="rounded-circle" style={{ height: '.9em', margin: '.1em' }} />)}</div>
				<div className="position-absolute top-0 end-0 smaller text-secondary opacity-50 lh-1 p-1">
					<i className={isFavorite(item.Dapp) ? "bi bi-star-fill" : "bi bi-star"} onClick={() => toggleFavorite(item.Dapp)} role="button"></i>
				</div>
			</div>
		)
	}



	return (
		<div className="">

			<Navbar className="mb-3 user-select-none" >
				<Container >
					<Navbar.Brand className="fw-900 text-uppercase">dapp <span className="opacity-50">limo</span></Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav" className="justify-content-end" >
						<Nav className="align-items-center">
							{gasPrice > 0 && <Navbar.Text className='smallx fw-500x px-3 opacity-50 text-nowrap d-none d-md-inline-block' title='Ethereum Base Fee (Gwei)'><i className='bi bi-fuel-pump-fill' /> {gasPrice}</Navbar.Text>}
							<input type="text" placeholder="Search" className="form-control me-2 rounded-pill border d-none d-md-inline-block" aria-label="Search" style={{ height: '2em', boxShadow: '0 0 0 #fff' }}  value={searchText} onChange={e => setSearchText(e.target.value)}  />
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
						{filteredDapps.length > 0 && filteredDapps.filter(item => item.categories.includes(c)).length > 0 &&
							<div className="d-flex justify-content-center align-items-center text-secondary opacity-75 mt-4 mt-md-5 mb-2 mb-md-3">
								{/* <hr className="w-25  opacity-10 m-0" /> */}
								<div className="smallx fw-600   mx-3 text-nowrap ">{c}</div>
								{/* <hr className="w-25  opacity-10 m-0" /> */}
							</div>
						}
						<div>
							{filteredDapps.length > 0 && filteredDapps.filter(item => item.categories.includes(c)).map(dappBlock)}
						</div>
					</div>
				)}



				<div className="my-5 py-5 small text-muted">
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
