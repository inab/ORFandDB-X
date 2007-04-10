function swe(el)
{
	var cel=el.firstChild;
	if(!('innerHTML' in cel)) {
		cel=cel.nextSibling;
	}
	var pel=el.parentNode;
	//var nel=el.nextSibling;
	if(pel.className=='') {
		cel.innerHTML='+';
		pel.className='expander-closed';
		//nel.style.display='none';
	} else {
		cel.innerHTML='\u2212';
		pel.className='';
		//nel.style.display='';
	}
}
