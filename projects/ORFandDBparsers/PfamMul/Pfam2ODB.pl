#!/usr/bin/perl -w

use strict;

sub pushNew($\@\%);
sub printGappedFragment($\@\@;$);
sub printResidues($$\@);
sub printLink($$$;\@);
sub printAllLinks($\@\@);
sub XMLize($);
sub referenceTagger($\@);
sub toECRef($$);
sub toUniRef($);
sub toPfamRef($);
sub toPubMedRef($$);

if(scalar(@ARGV)<2) {
	die "This program takes at least two parameters:\n\tone or more input files in mul format\n\tthe output XML file\n";
}

local(*OUTPUT);

open(OUTPUT,'>'.$ARGV[$#ARGV]) || die "ERROR: Unable to open ".$ARGV[$#ARGV]." for writing\n";

# And now, let's work!!!
print OUTPUT <<EOF;
<?xml version='1.0' encoding='ISO-8859-1'?>

<!--
	This XML document was generated by Pfam2ODB.pl script
	which was created by Jos� Mar�a Fern�ndez Gonz�lez
	jmfernandez\@cnio.es CNIO (C) 2007
-->
<PfamSet xmlns:odb='http://www.pdg.cnb.uam.es/jmfernandez/ORFandDB/4.0' xmlns:msa='http://www.pdg.cnb.uam.es/jmfernandez/ORFandDB/4.0/MSA' xmlns='http://www.pdg.cnb.uam.es/jmfernandez/ORFandDB/4.0/Pfam'>
EOF

foreach my $ifile (@ARGV[0..($#ARGV - 1)]) {
	local(*IFILE);
	
	my($openline)=undef;
	if($ifile =~ /\.gz$/) {
		$openline='gunzip -c "'.$ifile.'" |';
	} else {
		$openline='<'.$ifile;
	}
	
	if(open(IFILE,$openline)) {
		my($line);
		my(%mul)=();
		my(@mulord)=();
		my($alignlength)=undef;
		
		my(%GF)=();
		my($tempDC)=undef;
		my($tempRC)=undef;
		my($tempRN)=undef;
		my($tempNE)=undef;
		while($line=<IFILE>) {
			chomp($line);
			next if($line eq '');
			
			if($line eq '//') {
				if(scalar(@mulord)>0 && exists($GF{'AC'})) {
					print OUTPUT "\t<entry acc='",$GF{'AC'}[0],
						(defined($GF{'AC'}[1])?("' rev='".$GF{'AC'}[1]."'"):''),
						" description='",XMLize($GF{'DE'}),"'",
						" type='$GF{'TP'}'>\n";
					
					print OUTPUT "\t\t<id>$GF{'ID'}</id>\n";
					foreach my $pi (@{$GF{'PI'}}) {
						print OUTPUT "\t\t<id>$pi</id>\n";
					}
					
					foreach my $author (split(/, /,$GF{'AU'})) {
						print OUTPUT "\t\t<author>",XMLize($author),"</author>\n";
					}
					
					foreach my $bm (@{$GF{'BM'}}) {
						print OUTPUT "\t\t<buildCommand>",XMLize($bm),"</buildCommand>\n";
					}
					
					# Gathering threshold
					$GF{'GA'}[3] =~ tr/;//d;
					$GF{'NC'}[3] =~ tr/;//d;
					$GF{'TC'}[3] =~ tr/;//d;
					
					print OUTPUT "\t\t<stats mode='ls'>\n";
					print OUTPUT "\t\t\t<gatheringThreshold sequence='",$GF{'GA'}[0],"' domain='",$GF{'GA'}[1],"' />\n";
					print OUTPUT "\t\t\t<cutoff minSeqScore='",$GF{'TC'}[0],"' maxSeqScore='",$GF{'NC'}[0],"' minDomScore='",$GF{'TC'}[1],"' maxDomScore='",$GF{'NC'}[1],"' />\n";
					print OUTPUT "\t\t</stats>\n";
					print OUTPUT "\t\t<stats mode='fs'>\n";
					print OUTPUT "\t\t\t<gatheringThreshold sequence='",$GF{'GA'}[2],"' domain='",$GF{'GA'}[3],"' />\n";
					print OUTPUT "\t\t\t<cutoff minSeqScore='",$GF{'TC'}[2],"' maxSeqScore='",$GF{'NC'}[2],"' minDomScore='",$GF{'TC'}[3],"' maxDomScore='",$GF{'NC'}[3],"' />\n";
					print OUTPUT "\t\t</stats>\n\n";
					
					my($RN)=$GF{'RN'};
					# Now, the gathered links
					printAllLinks(\*OUTPUT,@{$GF{'DR'}},@{$RN});
					
					# And the literature links
					foreach my $link (@{$RN}) {
						my(@attr)=();
						
						push(@attr,['comment',referenceTagger($link->[1],@{$RN})])  if(defined($link->[1]));
						push(@attr,['refNumber',$link->[0]]);
						push(@attr,['title',$link->[3]])  if(defined($link->[3]));
						push(@attr,['location',$link->[5]])  if(defined($link->[5]));
							push(@attr,['author',$link->[4]])  if(defined($link->[4]));
						foreach my $author (split(/, /,$link->[4])) {
							$author =~ s/;? *$//;
							push(@attr,['author',$author]);
						}
						
						printLink(\*OUTPUT,'PubMed',$link->[2],@attr);
					}
					print OUTPUT "\n"  if(scalar(@{$RN})>0);
					
					# The comment, with some useful information
					if(exists($GF{'CC'})) {
						$GF{'CC'} =~ tr/ //s;
						print OUTPUT "\t\t<comment>",referenceTagger($GF{'CC'},@{$RN}),"</comment>\n";
					}
					
					# The maybe nested domains
					foreach my $nested (@{$GF{'NE'}}) {
						print OUTPUT "\t\t<maybeNested acc='$nested->[0]'>\n";
						printLink(\*OUTPUT,'Pfam',$nested->[0]);
						foreach my $nl (@{$nested->[1]}) {
							printLink(\*OUTPUT,'UniProt',$nl->[0],@{[['start',$nl->[1]],['end'=>$nl->[2]]]});
						}
						print OUTPUT "\t\t</maybeNested>\n";
					}
					
					# Now we have to write the MSA
					print OUTPUT "\t\t<seed length='$alignlength' source='$GF{'SE'}' alignmentMatches='$GF{'AM'}'",
						(exists($GF{'AL'})?" method='$GF{'AL'}'":''),
						">\n";
					my($gmsa)=undef;
					my($id)=1;
					foreach my $msa (@mulord) {
						if($msa->[0] eq '__c__') {
							$msa->[0]='consensus';
							$gmsa=$msa;
							next;
						}
						
						printGappedFragment(\*OUTPUT,@{$msa},@{$RN},$id);
						$id++;
					}
					printGappedFragment(\*OUTPUT,@{$gmsa},@{$RN})  if(defined($gmsa));
					printResidues(\*OUTPUT,$alignlength,@mulord);
					print OUTPUT "\t\t</seed>\n";
					print OUTPUT "\t</entry>\n";
				}
				
				# And we have to clean up the memory structures
				@mulord=();
				%mul=();
				$alignlength=undef;
				%GF=();
				$tempDC=undef;
				$tempRC=undef;
				$tempRN=undef;
				$tempNE=undef;
			} elsif(substr($line,0,1) eq '#') {
				# A comment line?
				if($line =~ /#=G([FCSR]) +([^ ]+) +(.*)/) {
					if($1 eq 'F') {
						# Generic per-File annotation, free text
						if(	$2 eq 'ID' ||
							$2 eq 'DE' ||
							$2 eq 'AU' ||
							$2 eq 'SE' ||
							$2 eq 'TP' ||
							$2 eq 'AL' ||
							$2 eq 'AM' ||
							$2 eq 'SQ'
						) {
							$GF{$2}=$3;
						} elsif($2 eq 'GA' || $2 eq 'TC' || $2 eq 'NC') {
							$GF{$2}=[split(/[ ;]+/,$3,4)];
						} elsif($2 eq 'AC') {
							$GF{'AC'}=[split(/\./,$3,2)];
						} elsif($2 eq 'PI') {
							push(@{$GF{'PI'}},split(/[ ;]+/,$3));
						} elsif($2 eq 'BM') {
							push(@{$GF{'BM'}},$3);
						} elsif($2 eq 'DC') {
							if(defined($tempDC)) {
								$tempDC .= ' '.$3;
							} else {
								$tempDC = $3;
							}
						} elsif($2 eq 'DR') {
							push(@{$GF{'DR'}},[$tempDC,split(/; /,substr($3,0,-1))]);
							$tempDC=undef;
						} elsif($2 eq 'RC') {
							if(defined($tempRC)) {
								$tempRC .= ' '.$3;
							} else {
								$tempRC = $3;
							}
						} elsif($2 eq 'RN') {
							my($number)=$3;
							$number =~ tr/[]//d;
							
							$tempRN=[$number,$tempRC,undef,undef,undef,undef];
							push(@{$GF{'RN'}},$tempRN);
							$tempRC=undef;
						} elsif($2 eq 'RM') {
							$tempRN->[2]=$3;
						} elsif($2 eq 'RT') {
							if(defined($tempRN->[3])) {
								$tempRN->[3] .= ' '.$3;
							} else {
								$tempRN->[3] = $3;
							}
						} elsif($2 eq 'RA') {
							if(defined($tempRN->[4])) {
								$tempRN->[4] .= ' '.$3;
							} else {
								$tempRN->[4] = $3;
							}
						} elsif($2 eq 'RL') {
							$tempRN->[5]=$3;
						} elsif($2 eq 'CC') {
							if(exists($GF{'CC'})) {
								$GF{'CC'} .= ' '.$3;
							} else {
								$GF{'CC'} = $3;
							}
						} elsif($2 eq 'NE') {
							$tempNE=[substr($3,0,-1),[]];
							push(@{$GF{'NE'}},$tempNE);
						} elsif($2 eq 'NL') {
							my($nested)=$3;
							$nested=~/^([^\/]+)\/([0-9]+)-([0-9]+)/;
							push(@{$tempNE->[1]},[$1,$2,$3]);
						} else {
							print STDERR "Warning: Unknown field $2. Skipping...\n";
						}
					} elsif($1 eq 'C') {
						# Generic per-Column annotation, exactly 1 char per column
						pushNew('__c__',@mulord,%mul);
						my($key)=$2;
						if($key eq 'SS_cons') {
							$key='SS';
						} elsif($key eq 'SA_cons') {
							$key='SA';
						} elsif($key eq 'seq_cons') {
							$key='res';
						}
						$mulord[$mul{'__c__'}][1]{$key}=$3;
					} elsif($1 eq 'S') {
						# Generic per-Sequence annotation, free text
						pushNew($2,@mulord,%mul);
						my(@GS)=split(/ +/,$3,2);
						
						if($GS[0] eq 'AC') {
							$mulord[$mul{$2}][5]=$GS[1];
							push(@{$mulord[$mul{$2}][4]},[undef,'UniProt',$GS[1]]);
						} elsif($GS[0] eq 'DR') {
							push(@{$mulord[$mul{$2}][4]},[undef,split(/; /,substr($GS[1],0,-1))]);
						} else {
							print STDERR "Warning: Unknown GS field $GS[0]. Skipping...\n";
						}
					} elsif($1 eq 'R') {
						# Generic per-Sequence AND per-Column mark up, exactly 1 char per column
						pushNew($2,@mulord,%mul);
						my(@GR)=split(/ +/,$3,2);
						$mulord[$mul{$2}][1]{$GR[0]}=$GR[1];
					}
				}
			} else {
				# A multiple sequence alignment line?
				my($id,$align)=split(/[ \t]+/,$line,2);
				# Removing white spaces from the alignment
				$align =~ tr/ //d  if(defined($align));
				unless(defined($align) && $id ne '') {
					warn "ERROR: Incorrect file format: incorrect alignment line\n";
					last;
				}
				
				$alignlength=length($align)  unless(defined($alignlength));
				if($alignlength!=length($align)) {
					warn "ERROR: Incorrect file format: alignment line $id should have $alignlength residues/gaps instead of ",length($align),"\n";
					last;
				}
				
				# Do we have extra info?
				pushNew($id,@mulord,%mul);
				$mulord[$mul{$id}][1]{'res'}=$align;
			}
		}
		close(IFILE);
	} else {
		warn "ERROR: Unable to open $ifile for reading\n";
	}
}

print OUTPUT "</PfamSet>\n";

# We have to close the output file once we have finished!
close(OUTPUT);


sub pushNew($\@\%) {
	my($id,$p_mulord,$p_mul)=@_;
	unless(exists($p_mul->{$id})) {
		my($bareid,$begin,$end)=(undef,undef,undef);
		if($id =~ /^([^\/]+)\/([1-9][0-9]*)-([1-9][0-9]*)$/) {
			$begin=$2;
			$end=$3;
			$bareid=$1;
		} else {
			$bareid=$id;
		}

		push(@{$p_mulord},[$bareid,{},$begin,$end,[],undef,(defined($begin)?$begin:1)]);
		$p_mul->{$id}=$#{$p_mulord};
	}
}

sub printGappedFragment($\@\@;$) {
	my($OUTPUT,$msa,$RN,$id)=@_;
	
	if(defined($msa->[5])) {
		print $OUTPUT "\t\t\t<gappedFragment uniAcc='$msa->[5]'>\n";
	} else {
		print $OUTPUT "\t\t\t<consensus>\n";
	}
	print $OUTPUT "\t\t\t<msa:gappedFragment name='".$msa->[0]."'",
		(defined($msa->[2])?" start='$msa->[2]'":''),
		(defined($msa->[3])?" end='$msa->[3]'":''),
		">";
	my($key,$val);
	while(($key,$val)=each(%{$msa->[1]})) {
		print $OUTPUT "<msa:content type='$key'",((defined($id) && $key eq 'res')?" id='$id'":''),">$val</msa:content>";
	}
	print $OUTPUT "</msa:gappedFragment>\n";
	printAllLinks($OUTPUT,@{$msa->[4]},@{$RN});
	
	print $OUTPUT "\t\t\t</",(defined($msa->[5])?'gappedFragment':'consensus'),">\n";
}

sub printResidues($$\@) {
	my($OUTPUT,$alignlength,$p_mulord)=@_;
	
	my($buffer)="\t\t<msa:residues>\n";
	foreach my $ap (0..($alignlength-1)) {
		my($jp)=undef;
		my($id)=1;
		foreach my $msa (@{$p_mulord}) {
			next if($msa->[0] eq '__c__');
			if(exists($msa->[1]{'res'})) {
				my($v)=substr($msa->[1]{'res'},$ap,1);
				# Skipping gaps
				unless($v eq '-' || $v eq '.') {
					unless(defined($jp)) {
						$buffer .= "\t\t\t<msa:rs p='".($ap+1)."'>\n";
						$jp='';
					}
					$buffer .= "\t\t\t\t<msa:r i='".$id."' p='".$msa->[6]."' v='".$v."' />\n";
					$msa->[6]++;
				}
			}
			$id++;
		}
		$buffer .= "\t\t\t</ms:rs>\n"  if(defined($jp));
	}
	$buffer .= "\t\t</msa:residues>\n";
	print $OUTPUT $buffer;
}

# This function substitutes offending XML
# symbols by friendly equivalent ones
sub XMLize($) {
	my($text)=@_;
	$text =~ s/&/&amp;/g;
	$text =~ s/</&lt;/g;
	$text =~ s/'/&apos;/g;
	
	return $text;
}	

sub printAllLinks($\@\@) {
	my($OUTPUT,$DR,$RN)=@_;
	
	foreach my $link (@{$DR}) {
		my($namespace,$id)=(undef,undef);
		my($chain)=undef;
		my(@attr)=();

		$namespace=$link->[1];
		$id=$link->[2];

		push(@attr,['comment',referenceTagger($link->[0],@{$RN})])  if(defined($link->[0]));
		if($namespace eq 'SCOP') {
			push(@attr,['level',(defined($link->[3])?$link->[3]:'')]);
		} elsif($namespace eq 'PDB') {
			($id,$chain)=split(/ +/,$id);

			$chain=''  unless(defined($chain));
			push(@attr,['chain',$chain]);
			push(@attr,['start',$link->[3]]);
			push(@attr,['end',$link->[4]]);
		}
		printLink($OUTPUT,$namespace,$id,@attr);
	}
	print $OUTPUT "\n"  if(scalar(@{$DR})>0);
}

sub printLink($$$;\@) {
	my($OUTPUT,$namespace,$id,$p_attr)=@_;
	
	print $OUTPUT "\t\t<odb:link namespace='$namespace' id='$id'>";
	if(defined($p_attr)) {
		foreach my $attr (@{$p_attr}) {
			if($attr->[0] eq 'comment') {
				print $OUTPUT "<odb:comment>$attr->[1]</odb:comment>";
			} else {
				print $OUTPUT "<odb:attr name='$attr->[0]'>$attr->[1]</odb:attr>";
			}
		}
	}
	print $OUTPUT "</odb:link>\n";
}

sub referenceTagger($\@) {
	my($totag)=XMLize($_[0]);

	$totag =~ s/EC([: ])((?:[0-9-]+\.){3}[0-9-]+)/&toECRef($1,$2)/sge;
	$totag =~ s/Swiss:([A-Z0-9]+)/&toUniRef($1)/sge;
	$totag =~ s/Pfam:(P[FB][0-9]+)/&toPfamRef($1)/sge;
	$totag =~ s/\[([0-9]+)\]/&toPubMedRef($1,$_[1])/sge;
	
	return $totag;
}

sub toECRef($$) {
	return "<odb:link id='$_[1]' namespace='ENZYME'><odb:text>EC$_[0]$_[1]</odb:text></odb:link>";
}

sub toUniRef($) {
	return "<odb:link id='$_[0]' namespace='UniProt'><odb:text>Swiss:$_[0]</odb:text></odb:link>";
}

sub toPfamRef($) {
	return "<odb:link id='$_[0]' namespace='Pfam'><odb:text>Pfam:$_[0]</odb:text></odb:link>";
}

sub toPubMedRef($$) {
	my($pubmedid)='';
	
	foreach my $pid (@{$_[1]}) {
		if($pid->[0] eq $_[0]) {
			$pubmedid=$pid->[2];
			last;
		}
	}
	return "<odb:link id='".$pubmedid."' namespace='PubMed'><odb:text>\[$_[0]\]</odb:text></odb:link>";
}
