#!/usr/local/bin/perl -w

use strict;

if(scalar(@ARGV)==2 && -d $ARGV[0]) {
	local(*OUTXML);
	
	if(open(OUTXML,'>'.$ARGV[1])) {
		my($good)=1;
		my($file);
		
		print OUTXML <<XML;
<?xml version='1.0' encoding='ISO-8859-1'?>

<taxonomy namespace="http://www.cnio.es/scombio/jmfernandez/ORFandDB/4/NCBI-Taxonomy">
XML
		
		{
			local(*INFILE);
			local $/="\t|\n";
			
			# OrganismDivision
			$file=$ARGV[0].'/division.dmp';
			if(open(INFILE,'<'.$file)) {
				my($line);

				while($line=<INFILE>) {
					chomp($line);
					my(@fields)=split(/\t\|\t/,$line);
					#print $fields[0],'-',$fields[1],"\n";
					
					my($comments)=$fields[3];
					if(defined($comments) && length($comments)>0) {
						$comments="Comments='$comments' ";
					} else {
						$comments='';
					}
					
					print OUTXML <<DIVNAME;
	<OrganismDivision DivisionID='$fields[0]' CDE='$fields[1]' DivisionName='$fields[2]' $comments/>
DIVNAME
				}

				close(INFILE);
			} else {
				warn "ERROR: I could not open file $file\n";
				$good=undef;
			}
			
			# Organism
			$file=$ARGV[0].'/nodes.dmp';
			if(defined($good) && open(INFILE,'<'.$file)) {
				my($line);
				my(@parent)=();
				my($defgen)='U';
				my($defchro)='U';
				
				# First pass, Organisms
				while($line=<INFILE>) {
					chomp($line);
					my(@fields)=split(/\t\|\t/,$line);
					#print $fields[0],'-',$fields[1],"\n";
					
					$parent[$fields[0]]=$fields[1];
					
					my($comments)=$fields[12];
					if(defined($comments) && length($comments)>0) {
						$comments="Comments='$comments' ";
					} else {
						$comments='';
					}
					
					my($chroid)="$fields[0].$defgen.$defchro";
					
					print OUTXML <<ORGNAME;
	<Organism DivisionID='$fields[4]' NCBI_TaxID='$fields[0]' Rank='$fields[2]' $comments/>
	<Genome NCBI_TaxID='$fields[0]' GType='$defgen' />
	<Chromosome CType='$defchro'>
		<Sequence Sequence='' Taxonomy='' ATCG='true'>
			<BioEntry AccNumber='$chroid' DbName='INTERNAL' />
		</Sequence>
	</Chromosome>
	<Possesses NCBI_TaxID='$fields[0]' GType='$defgen' AccNumber='$chroid' DbName='INTERNAL' />
ORGNAME
				}
				
				# Second pass, Is_Classified_Into
				#seek(INFILE,0,0);
				#while($line=<INFILE>) {
				#	chomp($line)=
				#}
				
				my($idx)=0;
				foreach my $par (@parent) {
					
					if(defined($par)) {
						print OUTXML <<ORGNAMEIS;
	<Is_Classified_Into NCBI_TaxID_Subtaxon='$idx' NCBI_TaxID_Parent='$par' />
ORGNAMEIS
					}
					
					$idx++;	
				}

				close(INFILE);
			} else {
				warn "ERROR: I could not open file $file\n";
				$good=undef;
			}
			
			# OrganismName		
			$file=$ARGV[0].'/names.dmp';
			if(defined($good) && open(INFILE,'<'.$file)) {
				my($line);

				while($line=<INFILE>) {
					chomp($line);
					my(@fields)=split(/\t\|\t/,$line);
					#print $fields[0],'-',$fields[1],"\n";
					
					my($nameclass)=uc($fields[3]);
					my($uniquename)=$fields[2];
					if(defined($uniquename) && length($uniquename)>0) {
						$uniquename="UniqueName='$uniquename' ";
					} else {
						$uniquename='';
					}
					
					print OUTXML <<ORGNAME;
	<OrganismName NCBI_TaxID='$fields[0]' Name='$fields[1]' NameClass='$nameclass' $uniquename/>
ORGNAME
				}

				close(INFILE);
			} else {
				warn "ERROR: I could not open file $file\n";
				$good=undef;
			}
		}
		
		print OUTXML "</taxonomy>\n";
		close(OUTXML);
		
		unless(defined($good)) {
			unlink($ARGV[1]);
			exit 1;
		}
	} else {
		die "ERROR: Unable to create file $ARGV[0]!!!\n";
	}
} else {
	die "$0: This program takes two parameters: a directory with NCBI TaxDump files and the output file\n";
}
