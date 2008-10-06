function swe(el)
{
	var cel=el.firstChild;
	if(!('innerHTML' in cel)) {
		cel=cel.nextSibling;
	}
	var pel=el.parentNode;
	//var nel=el.nextSibling;
	
	if(pel.className=='expander-deepopen') {
		cel.innerHTML='+';
		pel.className='expander-closed';
		//nel.style.display='none';
	} else {
		if(pel.className=='expander-closed') {
			cel.innerHTML='\u2212';
			pel.className='expander-open';
			//nel.style.display='none';
		} else {
			cel.innerHTML='=';
			pel.className='expander-deepopen';
			//nel.style.display='';
		}
	}
}

function swefour(el)
{
	var cel=el.firstChild;
	if(!('innerHTML' in cel)) {
		cel=cel.nextSibling;
	}
	var pel=el.parentNode;
	//var nel=el.nextSibling;
	
	if(pel.className=='expander-deepopen') {
		cel.innerHTML='+';
		pel.className='expander-closed';
		//nel.style.display='none';
	} else {
		if(pel.className=='expander-closed') {
			cel.innerHTML='\\';
			pel.className='expander-popup';
			//nel.style.display='none';
		} else {
			if(pel.className=='expander-popup') {
				cel.innerHTML='\u2212';
				pel.className='expander-open';
				//nel.style.display='';
			} else {
				cel.innerHTML='=';
				pel.className='expander-deepopen';
				//nel.style.display='';
			}
		}
	}
}
