#!/usr/local/bin/perl -w
use strict;

# This program is based on former code from Federico Abascal

#hace lo mismo que el "kws2xml.pl" pero con los EC numbers.

#Recibe, por línea de parámetros 1) el nombre y la localización del fichero enzyme.dat
# y 2) el fichero enzclass.dat para buscar los ec numbers que en el anterior
# fichero no existen (mas generales) y 3) swissprot|trembl|trembl_new

#OLD:Recibe, por línea de parámetros 1) el nombre y la localización del fichero enzyme.dat
#OLD: y 2) el fichero swissprot.dat para buscar posibles ec numbers que en el anterior
#OLD: fichero no existiesen.

my(@t, $ec, %enzymes, $id, $pre, $name, $MIM, %MIMS, $curr); #%ecs, $n_ecs);
#my($enz_file, $swiss_file) = ($ARGV[0], $ARGV[1]);
my($enz_file, $enzclass_file, $swiss_file) = ($ARGV[0], $ARGV[1], "");
for(my $i=2; $i<=$#ARGV; $i++) {
	$swiss_file .= "$ARGV[$i] ";
} chop($swiss_file);

open(E, $enz_file) || die "Couldn't open the enzyme file named <$enz_file>!\n";
while(<E>) {
	if(/^ID  /) {
		s/^ID +//;	chomp;
		$id = $_;
		$enzymes{$id}->{'EXISTE'} = "";
	} elsif(/^DE  / || /^AN  / || /^CA  / || /^CF  /) {
		$curr = (split)[0];
		s/^$curr +//;	chomp;
		$enzymes{$id}->{$curr} .= $_." ";
		$pre = tell(E);
		while(<E>) {
			if(!/^$curr /) {
				chop($enzymes{$id}->{$curr});
				$enzymes{$id}->{$curr} =~ s/[\.\,\;]$//;
				$enzymes{$id}->{$curr} =~ s/\'/\&\#39\;/g;
				$enzymes{$id}->{$curr} =~ s/[\x00-\x1F]//g;
				seek(E, $pre, 0);
				last;
			}
			s/^$curr +//;	chomp;
			$enzymes{$id}->{$curr} .= $_. " ";
			$pre = tell(E);
		}
	} elsif(/^DI  /) {
		s/^DI +//;  chomp;	s/[\.\,]$//;
		($name, $MIM) = (split(/\; MIM\: */,$_))[0,1];
		$name =~ s/\'/\&\#39\;/g;
		$name =~ s/[\x00-\x1F]//g;
		my($ref, $cogelo);
		$cogelo = 1;
		foreach $ref ( @{$enzymes{$id}->{'DI'}} ) {
			if($ref eq $MIM)
			{	$cogelo = 0;	}
		}
		if($cogelo == 1)
		{	push(@{$enzymes{$id}->{'DI'}}, $MIM);	}
		if(!exists($MIMS{$MIM}))
		{	$MIMS{$MIM} = $name;	}
		else
		{	print STDERR "Error: $MIM: <$MIMS{$MIM}>    ne    <$name>!\n" if($MIMS{$MIM} ne $name);	}		
	}
}
close(E);

print STDERR "  There are ", scalar(keys(%enzymes)), " EC numbers in $enz_file file\n";

#) NUEVO (16-nov-01)
#my $enzclass_file = "/giga/databases/SW/enzyme/enzclass.txt";
my($enz, $desc, @level, $level_counter, $linea);
open(E, $enzclass_file) || die "Couldn't open the enzclass.txt file named <$enzclass_file>!\n";
while(<E>) {	last if(/^Release/);	}
while(<E>) {	last if(/^\-\-\-\-/);	}
while(<E>) {
#1. -. -.-  Oxidoreductases.
#1. 1. -.-   Acting on the CH-OH group of donors.
#1. 1. 1.-    With NAD(+) or NADP(+) as acceptor.
	#Habr´a que usar una estructura de ´arbol o de memoria de los estados
	#anteriores e ir concatenando cosas.
	#P.e. 	level[0] = oxidore..
	#		level[1] = level[0]+Acting on the ...
	#		level[2] = level[1]+With Nad ...
	#Detecci´on de en qu´e nivel estamos: seg´un el n´umero de '-'s.
	if(/^\n/) {
		next;
	} elsif(/^\-\-\-/) {
		last;
	} else {
		chomp;
		($enz, $desc) = (split(/\.\-  /,$_))[0,1];
		$linea = tell(E);
		while(<E>) {
			if(!/^ /) {
				seek(E, $linea, 0);
				last;
			} else {
				s/^ +//;
				chomp;
				$desc .= $_;
			}
			$linea = tell(E);
		}
		$desc =~ s/^ +//;
		$desc =~ s/\'/\&\#39\;/g;
		$desc =~ s/[\x00-\x1F]//g;
		$enz .= ".-";
		$enz =~ s/ //g;
		$level_counter = $enz =~ s/\-/\-/g;
		if($level_counter < 3)
		{	$desc = $level[$level_counter+1]." ".$desc;		}
		$level[$level_counter] = $desc;
		#print STDERR "$enz:$level_counter:$desc\n";
		if(!exists($enzymes{$enz}))
		{	$enzymes{$enz}->{'DE'} = $desc;		}
	}
}
close(E);
#) FIN NUEVO.

#print STDERR "There are $n_ecs entries with EC numbers associated\n";
#print STDERR "There are ", scalar(keys(%ecs)), " different EC numbers\n";
print STDERR "  There are ", scalar(keys(%enzymes)), " EC numbers in $enz_file + $enzclass_file files\n";


#) COMENTADO EL D´IA 16-NOV-01. Se sustituye por la b´usqueda en enzclass.txt
for(my $i=2; $i<=$#ARGV; $i++) {
	open(S, $ARGV[$i]) || die "Couldn't open the swiss file named <$ARGV[$i]>!\n";
	while(<S>) {
	       if(/^DE /) {
			   chomp;
			   my $descripcion_jorl = $_;
			   while(<S>) {
			   		if(/^DE /) {
						chomp;
						s/^DE +/ /;
						$descripcion_jorl .= $_;
					} else {	last;	}
			   }
		       @t = split(/\(EC /,$descripcion_jorl);
		       for(my $i = 1; $i <= $#t; $i++) {
			       $ec = (split(/[\) ]/,$t[$i]))[0];
	#)NUEVO (12-DIC-01):
			       $ec =~ s/\. +/\./g;
				   $ec = (split(/[ \,\;\/]/,$ec))[0];
				   $ec =~ s/\.$//;
				   my $nro_puntos = $ec =~ s/\./\./g;
				   for(my $ni = $nro_puntos; $ni < 3; $ni++)
				   {   $ec .= ".-"							}
	#)FIN NUEVO (12-DIC-01).
				   if(!exists($enzymes{$ec})) {
				       #print STDERR "    $ec didn't exist in first file <$enz_file>\n";
				       $enzymes{$ec}->{'EXISTE'} = "";
			       }
			       #$ecs{$ec}++;
			       #$n_ecs++;
		       }
	       }
	}
	close(S);
#) FIN DE LO COMENTADO.
}
print STDERR "  There are ", scalar(keys(%enzymes)), " EC numbers in $enz_file + $enzclass_file + $swiss_file files\n";

print "<?xml version='1.0' encoding='iso-8859-1'?>\n\n";
print "<orfanddb>\n";
 foreach $MIM ( keys %MIMS )
 {	print "<Disease MIM='$MIM' name='$MIMS{$MIM}' />\n";	}
 print "\n\n";
 foreach $ec ( keys %enzymes ) {
	print "<ECnumber ECnumber='$ec' ";
	#ahora: para cada DE AN CA CF, miro si existe, y si sí, escribo el atributo.
	if(exists($enzymes{$ec}->{'DE'}))
	{	print "Description='$enzymes{$ec}->{'DE'}' ";	}
	if(exists($enzymes{$ec}->{'AN'}))
	{	print "Alternative_Name='$enzymes{$ec}->{'AN'}' ";	}
	if(exists($enzymes{$ec}->{'CA'}))
	{	print "Catalytic_Activity='$enzymes{$ec}->{'CA'}' ";	}
	if(exists($enzymes{$ec}->{'CF'}))
	{	print "CoFactors='$enzymes{$ec}->{'CF'}' ";	}
	print "/>\n";
	 foreach $MIM ( @{$enzymes{$ec}->{'DI'}} ) {
    	print "  <Deficient_In MIM='$MIM' ECnumber='$ec' />\n";
	 }
	#ahora: para cada DI, imprimo <Disease>mim, name (o como sea)</Disease>
 }
print "</orfanddb>\n";
print STDERR "EC numbers (and diseases related with them) in xml format!\n";


__END__
<ECnumber ECnumber='' Description='' Alternative_Name='' Catalytic_Activity=''
CoFactors='' />

<Disease MIM='' name='' />

<Deficient_In MIM='' ECnumber='' />

        Recuerda poner las entradas de ECnumber y de Disease antes de las de
Deficient_In (por la integridad referencial, ya sabes).





<?xml version='1.0' enconding='iso-8859-1'?>

<$ORF_XSD>
<ECnumber ECnumber='1.1.99.16' />
<ECnumber ECnumber='1.1.99.17' />
<KeyWord keyword='Alpha-amylase inhibitor' />
<KeyWord keyword='Acetylcholine receptor inhibitor' />
</$ORF_XSD>

